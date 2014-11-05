'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    errorHandler = require('../errors.server.controller.js'),
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
        user.modified = Date.now();
        user.displayName = user.firstName + ' ' + user.lastName;

        // Migrate if necessary:
        console.log('[Profile.Ctrl.update] types: ', user.types);
        user.migrate();
        console.log('[Profile.Ctrl.update] types: ', user.types);


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
                        res.json(user);
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

exports.list = function(req, res, next) {
    User
        .find()
        .sort('-created')
        .exec(function(err, users) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.jsonp(users);
            }
        });
};

/**
 * Return User by ID
 */
exports.read = function(req, res) {
    console.log('[Profile.Ctrl] read()');
    req.user.migrate();
    res.jsonp(req.user);
};


exports.readProfile = function(req, res) {
    console.log('[Profile.Ctrl] read()');
    req.user.migrate();
    res.jsonp(req.profile);
};
