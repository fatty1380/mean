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

        // Migrate if necessary:
        req.user.migrate();


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
 * Return User by ID
 */
exports.read = function(req, res) {
    console.log('[Profile.Ctrl] read()');
    req.user.migrate();
    res.jsonp(req.user);
};

/**
 * Send User
 */
exports.me = function(req, res) {
    console.log('[Profile.Ctrl] me()');
    req.user.migrate();
    res.jsonp(req.user || null);
};
