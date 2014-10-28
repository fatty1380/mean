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
		user.updated = Date.now();
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

/**
 * Return User by ID
 */
exports.read = function(req, res) {
    console.log('[Profile.Ctrl] read()');
    debugger; // TODO: Determine if this is still the correct method placement
    req.user.migrate();
    res.jsonp(req.user);
};

/**
 * Send User
 */
exports.me = function(req, res) {
    console.log('[Profile.Ctrl] me()');
    debugger;
    req.user.migrate();
    res.json(req.user || null);
};