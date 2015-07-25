'use strict';

module.exports = function(app) {
	var reviews = require('../controllers/reviews.server.controller');
	var reviewsPolicy = require('../policies/reviews.server.policy');

	// Reviews Routes
	app.route('/api/reviews')
		.all()
		.get(reviews.list);
	
	app.route('/api/profiles/:userId/reviews')
		.all()
		.get(reviews.list)
		.all(reviewsPolicy.isAllowed)
		.post(reviews.create);

	app.route('/api/reviews/:reviewId')
		.all(reviewsPolicy.isAllowed)
		.get(reviews.read)
		.put(reviews.update)
		.delete(reviews.delete);

	// Finish by binding the Review middleware
	app.param('reviewId', reviews.reviewByID);
};