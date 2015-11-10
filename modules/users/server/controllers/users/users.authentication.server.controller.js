'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    path = require('path'),
    passport = require('passport'),
    config = require(path.resolve('./config/config')),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    emailer = require(path.resolve('./modules/emailer/server/controllers/emailer.server.controller')),
    NotificationCtr = require(path.resolve('./modules/emailer/server/controllers/notifications.server.controller')),
    FeedCtrl = require(path.resolve('./modules/feeds/server/controllers/feeds.server.controller')),
    Q = require('q'),
    log = require(path.resolve('./config/lib/logger')).child({
        module: 'users.authentication',
        file: 'users.authentication.server.controller'
    });

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Driver = mongoose.model('Driver'),
    Company = mongoose.model('Company'),
    RequestMessage = mongoose.model('RequestMessage'),
    Login = mongoose.model('Login'),
    BranchData = mongoose.model('BranchData');

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

    req.log.info({ func: 'signup', type: req.body.type, username: req.body.username }, 'Signup for new user', req.body);
    var user, company, saves = [];

    req.body.type = req.body.type || 'driver';
    
    // Init Variables
    switch (req.body.type) {
        case 'driver':
            req.log.info({ func: 'signup' }, 'Signup for new Driver');
            user = new Driver(req.body);
            break;
        case 'owner':
            req.log.info({ func: 'signup' }, 'Signup for new Owner');
            user = new User(req.body);
            break;
        default: user = new User(req.body);
    }

    req.log.info({ func: 'signup', user: user }, 'Initialized');
    
    // Add missing user fields
    user.provider = 'local';

    saves.push(user.save());

    if (!!req.body.companyName && req.body.type === 'owner') {

        company = new Company({ 'owner': user._id, 'name': req.body.companyName });
        req.log.info({ func: 'signup', company: company }, 'Creating company');
        user.company = company._id;

        saves.push(company.save());
    }

    var newUser;

    return Q.all(saves)
        .then(function (results) {
            req.log.info({ func: 'signup', company: company }, 'Returned from saves');
            results.user = results[0];
            results.company = results[1];
            
            if (!_.isEmpty(results.company)) {
                NotificationCtr.events.emit('company:new', results.company, req);
            }

            // Invoke Notification Center Event as a Promise so that they are run
            // asynchronously and don't block or interrupt the signup flow
            Q.when(NotificationCtr.events.emit('user:new', results.user, req))
                .then(function success(result) {
                    req.log.info({ func: 'signup' }, 'Processed all event handlers');
                })
                .catch(function fail(err) {
                    debugger;
                    req.log.error(err, 'failed to send events');
                });
            
            req.log.info({ func: 'signup', user: user, ruser: results.user, company: results.company }, 'Saved User object');
            login(req, res, results.user, true);

            return results.user;
        })
        .catch(function (err) {
            req.log.error({ func: 'signup', err: err }, 'Error with Signup');
            if (!res.headersSent) {
                res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
        })
        .finally(function () {
            // Crappy hack to save to feed before returning the user ;/
            
            if (!res.headersSent) {
                res.json(req.user);
            }
        });
};

////////////////////////////////////////////////////////////////////////////
(function registerEvents() {
    NotificationCtr.events.on('user:new', logLogin);
    NotificationCtr.events.on('user:new', logBranchData);
    NotificationCtr.events.on('user:new', processNewUser);
})();

function logLogin(user, req) {
    (new Login({ input: user.username, result: 'signup', userId: user.id, ip: req.ip })).save().finally(_.noop);
}

function logBranchData(user, req) {
    if (_.isEmpty(req.body.branchData) && _.isEmpty(req.body.referralCode)) {
        return;
    }

    debugger;
    var referralCode = _.isString(req.body.referralCode) && !(/undefined/i.test(req.body.referralCode)) ? req.body.referralCode : null;
    var data = req.body.branchData || null;

    req.log.info({ func: 'signup', file: 'users.authentication', branchData: req.body.branchData, referralCode: referralCode }, 'Saving BranchData from New User Request');

    var branchData = new BranchData({
        user: user._id,
        data: data,
        referralCode: referralCode
    });

    branchData.save().then(
        function success(result) {
            debugger;
            req.log.info({ func: 'signup.saveBranch', file: 'users.authentication', result: result },
                'Saved BranchData from New User Request');
        },
        function fail(err) {
            debugger;
            req.log.error({ func: 'signup.saveBranch', file: 'users.authentication', err: err },
                'Failed to save Branch Data from New User Request');
        })
        .finally(_.noop);
}

function processNewUser(user, req) {
    if (user.isDriver) {
        //NotificationCtr.send('user:new', { user: user });

        createDefaultRequest(user, req.log);

        return FeedCtrl.postBodyToUserFeed(user.id, null, req.log);
    }
    else if (user.isOwner) {
        //emailer.sendTemplateBySlug('thank-you-for-signing-up-for-outset-owner', user);
    }
    else {
        req.log.warn('[SIGNPU] - Creating new User of type `%s` ... what to do?', req.body.type);
    }
}


function createDefaultRequest(user, reqLog) {
    reqLog = reqLog || log;

    var request = new RequestMessage({
        from: mongoose.Types.ObjectId(config.services.stubs.userId),
        to: user._id,
        requestType: 'friendRequest',
        status: 'sent'
    });

    return request.save().then(function (result) {
        reqLog.debug('Created New Default Request: ', result);
        return result;
    });
}

////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Signin after passport authentication
 */
exports.signin = function (req, res, next) {
    req.log.trace('[Auth.Ctrl] signin()', req.body);

    passport.authenticate('local', function (err, user, info) {
        req.log.trace({ func: 'signin', err: err, user: user, info: info }, '[Auth.Ctrl] Passport Auth Complete');
        if (err || !user) {
            var reason = !user ? 'no_user' : err && err.toString() || 'unknown';
            (new Login({ input: req.body.username, attempt: req.body.password, result: reason, userId: user && user.id || null })).save().finally(_.noop);


            req.log.error({ func: 'signin', info: info, err: err }, 'Login Failed');
            res.status(400).send(info);
        } else {
            (new Login({ input: req.body.username, attempt: req.body.password, result: 'success', userId: user.id }))
                .save()
                .finally(_.noop);
            login(req, res, user);
        }
    })(req, res, next);
};

/**
 * Signout
 */
exports.signout = function (req, res) {
    req.logout();

    if (!!req.body.redirect) {
        res.redirect('/');
    } else {
        res.status(200).send({ message: 'Successfully Logged Out' });
    }
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
function login(req, res, user, noResponse) {
    req.log.trace({ func: 'login' }, 'Logging in user %s', user.email);

    if (!_.isEmpty(user.salt + user.password)) {
        req.log.trace({ func: 'login' }, 'Cleansing User before returning');
        user.cleanse();
    }

    req.login(user, function (err) {
        if (err) {

            log.warn({ err: err }, 'Login Failed due to error');
            res.status(400).send(err);
        }
        else {
            req.log.trace({ func: 'login', user: req.user.email, roles: req.user.roles.join(',') }, 'Login Successful!');

            NotificationCtr.events.emit('login:success');

            if (_.isFunction(noResponse)) {
                return noResponse(null, user);
            }

            if (_.isBoolean(noResponse) && !!noResponse) {
                return;
            }

            res.json(req.user);
        }
    });
}

exports.login = login;