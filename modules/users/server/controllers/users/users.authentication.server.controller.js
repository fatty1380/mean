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
Q            = require('q');


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
            completeUserHydration(req, res, user);

            if (user.isDriver) {
                emailer.sendTemplateBySlug('thank-you-for-signing-up-for-outset-driver', user);
            }
            else if (user.isOwner) {
                emailer.sendTemplateBySlug('thank-you-for-signing-up-for-outset-owner', user);
            }
            else {
                console.log('[SIGNPU] - Creating new User of type `%s` ... what to do?', userType);
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
            completeUserHydration(req, res, user);
        }
    })(req, res, next);
};

function completeUserHydration(req, res, user) {

    user.cleanse();

    var deferred = Q.defer();

    if (user.isDriver && !user.driver) {
        console.log('[Auth] - Creating new Driver for user `%s`', user.id);

        Driver.findOne({
            user: user
        }).exec(function (err, driver) {
            if (err) {
                console.log('Error finding driver for user %s', user.id);
                return login(req, res, user);
            }

            if (!!driver) {
                console.log('[LOGIN] Found Driver %s for user %s', driver.id, user.id);

                deferred.resolve({driver: driver._id});
            } else {
                console.log('[SIGNUP] - Creating new Driver for user');
                var driver = new Driver({'user': user});

                driver.save(function (err) {
                    if (err) {
                        console.error('[SIGNUP] - err creating new driver', err);
                        return deferred.reject('Unable to create new driver: ' + err);
                    }

                    if(!!driver) {
                        deferred.resolve({driver: driver._id});
                    }
                    else {
                        deferred.reject('Unknown problem in creating new company');
                    }

                });
            }
        });
    }
    else if (user.isOwner && !user.company) {
        console.log('[Auth] - Creating new Company for user `%s`', user.id);

        Company.findOne({
            owner: user
        }).exec(function (err, company) {
            if (err) {
                console.log('Error finding company for user %s', user.id);
                return login(req, res, user);
            }

            if (!!company) {
                console.log('[LOGIN] Found Company %s for user %s', company.id, user.id);

                deferred.resolve({company: company._id});
            }
            else {
                console.log('[SIGNUP] - Creating new Company for user');

                var company = new Company({'owner': user, 'name': req.body.companyName});

                company.save(function (err) {
                    if (err) {
                        console.error('[SIGNUP] - err creating new Company', err);
                        return deferred.reject('Unable to create new company: ' + err);
                    }

                    if(!!company) {
                        deferred.resolve({company: company._id});
                    }
                    else {
                        deferred.reject('Unknown Problem in creating new company');
                    }
                });
            }
        });
    }
    else {
        return login(req, res, user);
    }

    deferred.promise.then(function(success) {
        var updateObj = success;
        console.log('[Auth.Hydrate] Updating with obj: %j', updateObj)

        updateAndLogin(user.id, updateObj).then(
            function (newUser) {
                login(req, res, newUser);
            }, function (err) {
                login(req, res, user);
            });
    }, function(err) {
        console.log('Unable to resolve new %s due to `%s`', user.isOwner ? 'Company' : 'Driver', err);
        login(req,res,user);
    });
}


function updateAndLogin(id, update) {

    var deferred = Q.defer();

    var query = {'_id': id};
    var options = {new: true};

    update.modified = Date.now();

    User.findOneAndUpdate(query, update, options, function (err, updatedUser) {
        if (err) {
            console.log('got an error: %j', err);
            return deferred.reject('Unable to save user\'s sub-profile due to ' + err.message);
        }
        updatedUser.cleanse();

        deferred.resolve(updatedUser);
    });

    return deferred.promise;
}

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
