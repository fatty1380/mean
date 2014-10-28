'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
<<<<<<< HEAD
    errorHandler = require('../errors'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    User = mongoose.model('User');
=======
	errorHandler = require('../errors.server.controller.js'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	User = mongoose.model('User');
>>>>>>> a7243763ea765d2ce4a837bb8fe138355f9e8640

/**
 * Update user details
 */
exports.update = function(req, res) {
<<<<<<< HEAD
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
                res.jsonp(user);
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
    debugger;
    req.user.migrate();
    res.jsonp(req.user);
=======
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
>>>>>>> a7243763ea765d2ce4a837bb8fe138355f9e8640
};

/**
 * Send User
 */
exports.me = function(req, res) {
<<<<<<< HEAD
    console.log('[Profile.Ctrl] me()');
    debugger;
    req.user.migrate();
    res.jsonp(req.user || null);
};
=======
	res.json(req.user || null);
};
>>>>>>> a7243763ea765d2ce4a837bb8fe138355f9e8640
