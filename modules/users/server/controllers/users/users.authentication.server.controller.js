'use strict';

/**
 * Module dependencies.
 */
var _        = require('lodash'),
path         = require('path'),
errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
mongoose     = require('mongoose'),
passport     = require('passport'),
User         = mongoose.model('User'),
Driver       = mongoose.model('Driver'),
Company      = mongoose.model('Company'),
emailer      = require(path.resolve('./modules/emailer/server/controllers/emailer.server.controller')),
Q            = require('q'),
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

    // Init Variables
    var user = new User(req.body);

    var userType = req.body.type;
    // Add missing user fields
    user.provider = 'local';
    user.displayName = user.firstName + ' ' + user.lastName;

    // Then save the user
    user.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            completeUserHydration(req, res, user);

            if (user.isDriver) {
                emailer.sendTemplateBySlug('thank-you-for-signing-up-for-outset-driver', user);
            }
            else if (user.isOwner) {
                emailer.sendTemplateBySlug('thank-you-for-signing-up-for-outset-owner', user);
            }
            else {
                req.log.debug('[SIGNPU] - Creating new User of type `%s` ... what to do?', userType);
            }
        }
    });


};

/**
 * Signin after passport authentication
 */
exports.signin = function (req, res, next) {
    req.log.debug('[Auth.Ctrl] signin()');

    passport.authenticate('local', function (err, user, info) {
        if (err || !user) {
            console.error(info, err);
            res.status(400).send(info);
        } else {
            completeUserHydration(req, res, user);
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
                return res.redirect('/#!/signin');
            }
            req.login(user, function (err) {
                if (err) {
                    return res.redirect('/#!/signin');
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
                return done(err, user, '/#!/settings/accounts');
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



function updateUser(id, update) {

    var deferred = Q.defer();

    var query = { '_id': id };
    var options = { new: true };

    log.info({ func: 'updateUser', query: query, update: _.keys(update), options: options }, 'Updating User');

    User.findOneAndUpdate(query, update, options, function (err, updatedUser) {
        if (err) {
            log.error({ func: 'updateUser', error: err }, 'got an error: %j', err);
            return deferred.reject('Unable to save user\'s sub-profile due to ' + err.message);
        }
        
        deferred.resolve(updatedUser);
    });

    return deferred.promise;
}

// DRY Simple Login Function
function login(req, res, user) {
    req.log.trace({ func: 'login' }, 'Logging in user %s', user.email);
    
    if (!_.isEmpty(user.salt + user.password)) {
        req.log.info({ func: 'login' }, 'USER HAS NOT BEEN CLEANSED!')
        user.cleanse();
    }

    req.login(user, function (err) {
        if (err) {
            log.warn({ err: err }, 'Login Failed due to error');
            res.status(400).send(err);
        } else {
            log.info({func: 'login', user: user.username}, 'Login Successful!');

            res.jsonp(user);
        }
    });
};

function completeUserHydration(req, res, user) {

    var typeProfileSearch;

    if (user.isDriver && !user.driver) {
        typeProfileSearch = Driver.findOne({
            user: user
        });
    }
    else if (user.isOwner && !user.company) {
        typeProfileSearch = Company.findOne({
            owner: user
        })
    } else {
        return login(req, res, user);
    }

    typeProfileSearch.then(function (success) {
        req.log.debug({ func: 'completeUserHydration' }, 'Creating new %s for user `%s`', user.isOwner ? 'COMPANY' : 'DRIVER', user.id);
        var promises = {};
        var userUpdateDoc = { modified: Date.now() };

        if (user.isDriver) {
            var newDriver = success || new Driver({ 'user': user });
            userUpdateDoc.driver = newDriver;

            promises.driver = !!success ? success : newDriver.save();
        }

        if (user.isOwner) {
            var newCompany = success || new Company({ 'owner': user, 'name': req.body.companyName });
            userUpdateDoc.company = newCompany;

            promises.company = !!success ? success : newCompany.save();
        }

        promises.user = updateUser(user._id, userUpdateDoc);

        req.log.info({ func: 'completeUserHydration'}, 'Saving Profile and User');

        return Q.all([promises.user, promises.driver, promises.company]);
    })
        .then(function (success) {
        req.log.info({ func: 'completeUserHydration' },
            'Successfully updated user with new %s Object ... logging in now', user.isOwner ? 'Company' : 'Driver');

        var newUser = success[0];
        return login(req, res, newUser);
    })
        .then(null, function (err) {
        req.log.error('Failed to create or update user\'s %s due to `%s`', user.isOwner ? 'Company' : 'Driver', err);

        return login(req, res, user);
    });
}