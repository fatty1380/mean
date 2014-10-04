'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    errorHandler = require('../errors'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    User = mongoose.model('User');

/**
 * Update user details
 */
exports.update = function(req, res) {
    // Init Variables
    var user = req.user;
    var message = null;

    console.log('[Profile.Ctrl] update()');

    // For security measurement we remove the roles from the req.body object
    delete req.body.roles;

    if (user) {
        // Merge existing user
        user = _.extend(user, req.body);
        user.updated = Date.now();
        user.displayName = user.firstName + ' ' + user.lastName;

        user.save(function(err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                req.login(user, function(err) {
                    if (err) {
                        res.status(400).send(err);
                    } else {
                        res.jsonp(user);
                    }
                });
            }
        });
    } else {
        res.status(400).send({
            message: 'User is not signed in'
        });
    }
};

/**
 * Update user details
 * This version is from the Outset code, and must be merged into the update method above
 */
exports.update_TO_BE_MERGED_TO_ABOVE = function(req, res) {
    //debugger;
    // Init Variables
    var user = req.user;
    var message = null;

    // For security measurement we remove the roles from the req.body object
    delete req.body.roles;

    if (user) {
        // Merge existing user
        user = _.extend(user, req.body);
        user.updated = Date.now();
        user.displayName = user.firstName + ' ' + user.lastName;

        if (req.body.driver) {

            var driver = req.user.driver;
            debugger;
            driver = _.extend(driver, req.body.driver);
            driver.updated = Date.now;

            driver.save(function(err) {
                if (err) {
                    debugger;
                    console.log('[err] error saving driver\n\t' + err);
                    return res.send(400, {
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    //req.login(user, function(err) {
                    //    if (err) {
                    //        console.log('[log] error saving user\n\t' + err);
                    //        res.send(400, err);
                    //    } else {
                    //        console.log('successfully saved user');
                    //        res.jsonp(user);
                    //    }
                    //});
                    debugger;
                    user.driver = driver._id;

                    user.save(function(err) {
                        if (err) {
                            console.log('[err] error saving user\n\t' + err);
                            return res.send(400, {
                                message: errorHandler.getErrorMessage(err)
                            });
                        } else {
                            req.login(user, function(err) {
                                if (err) {
                                    console.log('[log] error saving user\n\t' + err);
                                    res.send(400, err);
                                } else {
                                    console.log('successfully saved user');
                                    res.jsonp(user);
                                }
                            });
                        }
                    });
                }
            });
        } else {
            user.save(function(err) {
                if (err) {
                    console.log('[err] error saving user\n\t' + err);
                    return res.send(400, {
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    req.login(user, function(err) {
                        if (err) {
                            console.log('[log] error saving user\n\t' + err);
                            res.send(400, err);
                        } else {
                            console.log('successfully saved user');
                            res.jsonp(user);
                        }
                    });
                }
            });
        }
    } else {
        res.send(400, {
            message: 'User is not signed in'
        });
    }
};

/**
 * Return User by ID
 */
exports.read = function(req, res) {
    console.log('[Profile.Ctrl] read()');
    debugger;
    res.jsonp(req.user);
};

/**
 * Send User
 */
exports.me = function(req, res) {
    console.log('[Profile.Ctrl] me()');
    res.jsonp(req.user || null);
};
