'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    path = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    mongoose = require('mongoose'),
    passport = require('passport'),
    User = mongoose.model('User'),
    Driver = mongoose.model('Driver'),
    Company = mongoose.model('Company'),
    emailer = require(path.resolve('./modules/emailer/server/controllers/emailer.server.controller')),
    Q = require('q'),
    log = require(path.resolve('./config/lib/logger')).child({
        module: 'users.authentication',
        file: 'users.authentication.server.controller'
    });

exports.userseed = function (req, res) {
    delete req.body.roles;

    req.log.info({ email: req.body.email }, 'Creating Seed User for email %s', req.body.email);

    var user = new User(req.body);
};

/**
 * Signup
 */
exports.signup = function (req, res) {
    // For security measurement we remove the roles from the req.body object
    delete req.body.roles;

    req.log.info({ func: 'signup', type: req.body.type, username: req.body.username }, 'Signup for new user');
    var user, company, saves = [{}, {}];
    
    req.body.type = req.body.type || 'driver';
    
    // Init Variables
    switch (req.body.type) {
        case 'driver': 
            user = new Driver(req.body);
            break;
        case 'owner':
            user = new User(req.body);
            break;
        default: user = new User(req.body);
    }
    
    req.log.info({ func: 'signup', user: user }, 'Initialized');
    
    // Add missing user fields
    user.provider = 'local';

    if (!!req.body.companyName && req.body.type === 'owner') {
        
        company = new Company({ 'owner': user._id, 'name': req.body.companyName });
        req.log.info({ func: 'signup', company: company }, 'Creating company');
        user.company = company._id;

        saves[1] = company.save();
    }

    saves[0] = user.save();

    req.log.info({ func: 'signup', saves: saves }, 'Waiting for saves');
    return Q.all(saves)
        .then(function (results) {
            req.log.info({ func: 'signup', company: company }, 'Returned from saves');
            results.user = results[0];
            results.company = results[1];
            
            req.log.info({ func: 'signup', user: user, ruser: results.user, company: results.company }, 'Saved User object');
            login(req, res, results.user);

            if (results.user.isDriver) {
                emailer.sendTemplateBySlug('thank-you-for-signing-up-for-outset-driver', results.user);
            }
            else if (results.user.isOwner) {
                emailer.sendTemplateBySlug('thank-you-for-signing-up-for-outset-owner', results.user);
            }
            else {
                req.log.warn('[SIGNPU] - Creating new User of type `%s` ... what to do?', req.body.type);
            }
        })
        .catch(function (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        });
};

/**
 * Signin after passport authentication
 */
exports.signin = function (req, res, next) {
    req.log.trace('[Auth.Ctrl] signin()');

    passport.authenticate('local', function (err, user, info) {
        req.log.trace({ func: 'signin', err: err, user: user, info: info }, '[Auth.Ctrl] Passport Auth Complete');
        if (err || !user) {
            req.log.error({ func: 'signin', info: info, err: err }, 'Login Failed');
            res.status(400).send(info);
        } else {
            login(req, res, user);
            //completeUserHydration(req, res, user);
        }
    })(req, res, next);
};

/**
 * Signout
 */
exports.signout = function (req, res) {
    req.logout();
    res.redirect('/');
};

/**
 * OAuth callback
 */
exports.oauthCallback = function (strategy) {
    return function (req, res, next) {
        passport.authenticate(strategy, function (err, user, redirectURL) {
            if (err || !user) {
                return res.redirect('/');
            }
            req.login(user, function (err) {
                if (err) {
                    return res.redirect('/');
                }

                return res.redirect(redirectURL || '/');
            });
        })(req, res, next);
    };
};

/**
 * Helper function to save or update a OAuth user profile
 */
exports.saveOAuthUserProfile = function (req, providerUserProfile, done) {
    if (!req.user) {
        // Define a search query fields
        var searchMainProviderIdentifierField = 'providerData.' + providerUserProfile.providerIdentifierField;
        var searchAdditionalProviderIdentifierField = 'additionalProvidersData.' + providerUserProfile.provider + '.' + providerUserProfile.providerIdentifierField;

        // Define main provider search query
        var mainProviderSearchQuery = {};
        mainProviderSearchQuery.provider = providerUserProfile.provider;
        mainProviderSearchQuery[searchMainProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

        // Define additional provider search query
        var additionalProviderSearchQuery = {};
        additionalProviderSearchQuery[searchAdditionalProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

        // Define a search query to find existing user with current provider profile
        var searchQuery = {
            $or: [mainProviderSearchQuery, additionalProviderSearchQuery]
        };

        User.findOne(searchQuery, function (err, user) {
            if (err) {
                return done(err);
            } else {
                if (!user) {
                    var possibleUsername = providerUserProfile.username || ((providerUserProfile.email) ? providerUserProfile.email.split('@')[0] : '');

                    User.findUniqueUsername(possibleUsername, null, function (availableUsername) {
                        user = new User({
                            firstName: providerUserProfile.firstName,
                            lastName: providerUserProfile.lastName,
                            username: availableUsername,
                            displayName: providerUserProfile.displayName,
                            email: providerUserProfile.email,
                            profileImageURL: providerUserProfile.profileImageURL,
                            provider: providerUserProfile.provider,
                            providerData: providerUserProfile.providerData
                        });

                        // And save the user
                        user.save(function (err) {
                            return done(err, user);
                        });
                    });
                } else {
                    return done(err, user);
                }
            }
        });
    } else {
        // User is already logged in, join the provider data to the existing user
        var user = req.user;

        // Check if user exists, is not signed in using this provider, and doesn't have that provider data already configured
        if (user.provider !== providerUserProfile.provider && (!user.additionalProvidersData || !user.additionalProvidersData[providerUserProfile.provider])) {
            // Add the provider data to the additional provider data field
            if (!user.additionalProvidersData) {
                user.additionalProvidersData = {};
            }
            user.additionalProvidersData[providerUserProfile.provider] = providerUserProfile.providerData;

            // Then tell mongoose that we've updated the additionalProvidersData field
            user.markModified('additionalProvidersData');

            // And save the user
            user.save(function (err) {
                return done(err, user, '/settings/accounts');
            });
        } else {
            return done(new Error('User is already connected using this provider'), user);
        }
    }
};

/**
 * Remove OAuth provider
 */
exports.removeOAuthProvider = function (req, res, next) {
    var user = req.user;
    var provider = req.param('provider');

    if (user && provider) {
        // Delete the additional provider
        if (user.additionalProvidersData[provider]) {
            delete user.additionalProvidersData[provider];

            // Then tell mongoose that we've updated the additionalProvidersData field
            user.markModified('additionalProvidersData');
        }

        user.save(function (err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                login(req, res, user);
            }
        });
    }
};

// DRY Simple Login Function
function login(req, res, user) {
    req.log.debug({ func: 'login' }, 'Logging in user %s', user.email);

    if (!_.isEmpty(user.salt + user.password)) {
        req.log.debug({ func: 'login' }, 'Cleansing User before returning');
        user.cleanse();
    }

    req.login(user, function (err) {
        if (err) {
            log.warn({ err: err }, 'Login Failed due to error');
            res.status(400).send(err);
        } 
        else {
            req.log.info({ func: 'login', user: req.user.email, roles: req.user.roles.join(',') }, 'Login Successful!');

            res.json(req.user);
        }
    });
}