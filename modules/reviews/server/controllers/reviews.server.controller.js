'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	path = require('path'),
	mongoose = require('mongoose'),
	Review = mongoose.model('Review'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a Review
 */
exports.create = function(req, res) {
	var review = new Review(req.body);
	review.user = req.user;

	review.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(review);
		}
	});
};

/**
 * Show the current Review
 */
exports.read = function(req, res) {
	res.jsonp(req.review);
};

/**
 * Update a Review
 */
exports.update = function(req, res) {
	var review = req.review ;

	review = _.extend(review , req.body);

	review.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(review);
		}
	});
};

/**
 * Delete an Review
 */
exports.delete = function(req, res) {
	var review = req.review ;

	review.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(review);
		}
	});
};

/**
 * List of Reviews
 */
exports.list = function(req, res) { Review.find().sort('-created').populate('user', 'displayName').exec(function(err, reviews) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(reviews);
		}
	});
};

/**
 * Review middleware
 */
exports.reviewByID = function(req, res, next, id) { Review.findById(id).populate('user', 'displayName').exec(function(err, review) {
		if (err) return next(err);
		if (! review) return next(new Error('Failed to load Review ' + id));
		req.review = review ;
		next();
	});
};