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
emailer      = require(path.resolve('./modules/emailer/server/controllers/emailer.server.controller'));


// DRY Simple Login Function
var login = function (req, res, user) {
    console.log('[Auth.Ctrl] login()');

    req.login(user, function (err) {
        if (err) {
            res.status(400).send(err);
        } else {
            console.log('Login Successful!');
            res.jsonp(user);
        }
    });
};

/**
 * Signup
 */
exports.signup = function (req, res) {
    // For security measurement we remove the roles from the req.body object
    delete req.body.roles;

    console.log('[Auth.Ctrl] signup.%s(%s)', req.body.type, req.body.username);

    // Init Variables
    var user = new User(req.body);
    var message = null;

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
            // Clean Username and Password from the object...
            user.cleanse();

            if (userType === 'driver') {
                debugger;
                console.log('[SIGNUP] - Creating new Driver for user');

                var driver = new Driver({'user': user});

                driver.save(function (err) {
                    if (err) {
                        console.error('[SIGNUP] - err creating new driver', err);
                    }

                    user = _.extend(user, {driver : driver});

                    user.save(function (err) {
                        if (err) {
                            console.log('Error Saving Driver back to User... oh well');
                        }

                        login(req, res, user);
                    });

                });

                emailer.sendTemplateBySlug('thank-you-for-signing-up-for-outset-driver', user);

            }
            else if (userType === 'owner') {
                debugger;
                console.log('[SIGNUP] - Creating new Company for user');

                var company = new Company({'owner': user, 'name': req.body.companyName});

                company.save(function (err) {
                    if (err) {
                        console.error('[SIGNUP] - err creating new Company', err);
                    }

                    user = _.extend(user, {company : company});

                    user.save(function (err) {
                        if (err) {
                            console.log('Error Saving Company back to User... oh well');
                        }

                        login(req, res, user);
                    });
                });

                emailer.sendTemplateBySlug('thank-you-for-signing-up-for-outset-owner', user, 'chad@joinoutset.com');
            }
            else {
                console.log('[SIGNPU] - Creating new User of type `%s` ... what to do?', userType);

                login(req, res, user);
            }
        }
    });


};

/**
 * Signin after passport authentication
 */
exports.signin = function (req, res, next) {
    console.log('[Auth.Ctrl] signin()');

    passport.authenticate('local', function (err, user, info) {
        if (err || !user) {
            console.error(info, err);
            res.status(400).send(info);
        } else {

            user.cleanse();
            debugger; // TODO: Dude, seriously, defer this shit

            if (user.isDriver && !user.driver) {

                Driver.findOne({
                    user: user
                }).exec(function (err, driver) {
                    if (err) {
                        console.log('Error finding driver for user %s', user._id);
                    }

                    if (!!driver) {
                        console.log('Found Driver %s for user %s', driver._id, user._id);

                        user = _.extend(user, {driver : driver});

                        user.save(function (err) {
                            if (err) {
                                console.log('Error Saving Driver back to User... oh well');
                            }

                            login(req, res, user);
                        });
                    } else {
                        login(req, res, user);
                    }
                });
            }
            else if (user.isOwner && !user.company) {

                Company.findOne({
                    owner: user
                }).exec(function (err, company) {
                    if (err) {
                        console.log('Error finding company for user %s', user._id);
                    }

                    if (!!company) {
                        console.log('Found Company %s for user %s', company._id, user._id);

                        user = _.extend(user, {company : company});

                        user.save(function (err) {
                            if (err) {
                                console.log('Error Saving Company back to User... oh well');
                            }

                            login(req, res, user);
                        });
                    }
                    else {
                        login(req, res, user);
                    }
                });
            }
            else {
                login(req, res, user);
            }

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
                req.login(user, function (err) {
                    if (err) {
                        res.status(400).send(err);
                    } else {
                        res.json(user);
                    }
                });
            }
        });
    }
};
