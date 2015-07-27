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
 * Reviews module.
 * @module reviews
 */

/**
 * Creates a new Review
 * 
 * @param req.body
 * @example req.body
 *     user: '54af4aa84a60c143e96d097c',
 *     reviewer: null,
 *     name: 'Joe M',
 *     email: 'joe@mtrucks.com',
 *     title: 'Safe, clean and on time!',
 *     text: 'Dan is incredibly professional, and in the 5 years he has been delivering freight to my job sites, he has never let me down',
 *     rating: 5
 * }
 * 
 * @usage: A user (req.user) POSTs a new review for a specific user in the system (req.body.user)
 */
exports.create = function (req, res) {
	req.log.debug({ module: 'reviews', func: 'create', body: req.body });
	var review = new Review(req.body);

	review.reviewer = req.user;

	review.save(function (err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(review);
		}
	});
};

/**
 * Show the current Review
 */
exports.read = function (req, res) {
	req.log.debug({ module: 'reviews', func: 'read', review: req.review });
	res.json(req.review);
};

/**
 * Update a Review
 */
exports.update = function (req, res) {
	req.log.debug({ module: 'reviews', func: 'update', review: req.review });
	var review = req.review;

	review = _.extend(review, req.body);

	review.save(function (err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(review);
		}
	});
};

/**
 * Delete an Review
 */
exports.delete = function (req, res) {
	req.log.debug({ module: 'reviews', func: 'delete', review: req.review });
	var review = req.review;

	review.remove(function (err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(review);
		}
	});
};

/**
 * List of Reviews
 */
exports.list = function (req, res) {
	
	req.log.debug({ module: 'reviews', func: 'list' });

	var reviewedParty = req.profile || req.user;

	Review.find({ user: reviewedParty.id }) 
		.sort('-created')
		.populate('user', 'displayName')
		.exec()
		.then(
			function (reviews) {
				return res.json(reviews);
			},
			function (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			});
};

/**
 * Review middleware
 */
exports.reviewByID = function (req, res, next, id) {
	
	req.log.debug({ module: 'reviews', func: 'reviewByID' });
	
	Review.findById(id)
		.populate('user', 'displayName')
		.exec()
		.then(
			function (review) {
				if (!review) { return next(new Error('Failed to load Review ' + id)); }
				req.review = review;
				next();
			},
			function (err) {
				return next(err);
			});
};