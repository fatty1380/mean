'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Driver = mongoose.model('Driver'),
	_ = require('lodash');

/**
 * Get the error message from error object
 */
var getErrorMessage = function(err) {
	var message = '';

	if (err.code) {
		switch (err.code) {
			case 11000:
			case 11001:
				message = 'Driver already exists';
				break;
			default:
				message = 'Something went wrong';
		}
	} else {
		for (var errName in err.errors) {
			if (err.errors[errName].message) message = err.errors[errName].message;
		}
	}

	return message;
};

/**
 * Create a Driver
 */
exports.create = function(req, res) {
	var driver = new Driver(req.body);
	driver.user = req.user;

	driver.save(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(driver);
		}
	});
};

/**
 * Show the current Driver
 */
exports.read = function(req, res) {
	res.jsonp(req.driver);
};

/**
 * Update a Driver
 */
exports.update = function(req, res) {
	var driver = req.driver ;

	driver = _.extend(driver , req.body);

	driver.save(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(driver);
		}
	});
};

/**
 * Delete an Driver
 */
exports.delete = function(req, res) {
	var driver = req.driver ;

	driver.remove(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(driver);
		}
	});
};

/**
 * List of Drivers
 */
exports.list = function(req, res) { Driver.find().sort('-created').populate('user', 'displayName').exec(function(err, drivers) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(drivers);
		}
	});
};

/**
 * Driver middleware
 */
exports.driverByID = function(req, res, next, id) { Driver.findById(id).populate('user', 'displayName').exec(function(err, driver) {
		if (err) return next(err);
		if (! driver) return next(new Error('Failed to load Driver ' + id));
		req.driver = driver ;
		next();
	});
};

/**
 * Driver authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.driver.user.id !== req.user.id) {
		return res.send(403, 'User is not authorized');
	}
	next();
};