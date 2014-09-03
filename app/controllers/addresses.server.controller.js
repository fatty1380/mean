'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Address = mongoose.model('Address'),
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
				message = 'Address already exists';
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
 * Create a Address
 */
exports.create = function(req, res) {
	var address = new Address(req.body);
	address.user = req.user;

	address.save(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(address);
		}
	});
};

/**
 * Show the current Address
 */
exports.read = function(req, res) {
	res.jsonp(req.address);
};

/**
 * Update a Address
 */
exports.update = function(req, res) {
	var address = req.address ;

	address = _.extend(address , req.body);

	address.save(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(address);
		}
	});
};

/**
 * Delete an Address
 */
exports.delete = function(req, res) {
	var address = req.address ;

	address.remove(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(address);
		}
	});
};

/**
 * List of Addresses
 */
exports.list = function(req, res) { Address.find().sort('-created').populate('user', 'displayName').exec(function(err, addresses) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(addresses);
		}
	});
};

/**
 * Address middleware
 */
exports.addressByID = function(req, res, next, id) { Address.findById(id).populate('user', 'displayName').exec(function(err, address) {
		if (err) return next(err);
		if (! address) return next(new Error('Failed to load Address ' + id));
		req.address = address ;
		next();
	});
};

/**
 * Address authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.address.user.id !== req.user.id) {
		return res.send(403, 'User is not authorized');
	}
	next();
};