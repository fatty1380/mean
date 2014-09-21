'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors'),
	Bgcheck = mongoose.model('Bgcheck'),
	_ = require('lodash');

/**
 * Create a Bgcheck
 */
exports.create = function(req, res) {
	var bgcheck = new Bgcheck(req.body);
	bgcheck.user = req.user;

	bgcheck.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(bgcheck);
		}
	});
};

/**
 * Show the current Bgcheck
 */
exports.read = function(req, res) {
	res.jsonp(req.bgcheck);
};

/**
 * Update a Bgcheck
 */
exports.update = function(req, res) {
	var bgcheck = req.bgcheck ;

	bgcheck = _.extend(bgcheck , req.body);

	bgcheck.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(bgcheck);
		}
	});
};

/**
 * Delete an Bgcheck
 */
exports.delete = function(req, res) {
	var bgcheck = req.bgcheck ;

	bgcheck.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(bgcheck);
		}
	});
};

/**
 * List of Bgchecks
 */
exports.list = function(req, res) { Bgcheck.find().sort('-created').populate('user', 'displayName').exec(function(err, bgchecks) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(bgchecks);
		}
	});
};

/**
 * Bgcheck middleware
 */
exports.bgcheckByID = function(req, res, next, id) { Bgcheck.findById(id).populate('user', 'displayName').exec(function(err, bgcheck) {
		if (err) return next(err);
		if (! bgcheck) return next(new Error('Failed to load Bgcheck ' + id));
		req.bgcheck = bgcheck ;
		next();
	});
};

/**
 * Bgcheck authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.bgcheck.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};