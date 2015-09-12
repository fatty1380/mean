'use strict';

var should = require('should'),
	Q = require('q'),
	request = require('supertest-as-promised')(Q.Promise),
	path = require('path'),
	express = require(path.resolve('./config/lib/express')),
	stubs = require(path.resolve('./config/lib/test.stubs')),
    log = require(path.resolve('./config/lib/logger')).child({
        module: 'tests',
        file: 'feed.server.routes'
    });

var mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Review = mongoose.model('Review');
	
/**
 * Globals
 */
var app, agent, credentials, user, target, review;

var _test;
/**
 * Review routes tests
 */
describe('Review CRUD tests', function () {
	before(function (done) {
		log.debug({ func: 'beforeAll' }, 'Setup Base');
		// Get application
		app = express.init(mongoose);
		agent = request.agent(app.http);

		done();
	});

	beforeEach(function () {
		log.debug({ func: 'beforeEach' }, 'Setup');

        user = new User(stubs.user);
		target = new User(stubs.getUser());
        credentials = stubs.getCredentials(user);

		// Save a user to the test db and create new Feed
		//return Q.all([user.save(), feed.save()]).then(
		return Q.all([user.save(), target.save()]).then(
			function () {
				review = {
					to: target,
					name: user.firstName,
					email: user.email,
					title: 'This is a Review',
					text: 'I bet you think this review is about you',
					rating: 5
				};
			});
	});
	
	/**
	 * Test stubs
	 */
	 
	/**
	 * 	should be able to get a list of reviews for the current user
	 * 		/api/reviews
	 * 	should be able to get a list of reviews for a specific user
	 * 		/api/profiles/:userId/reviews
	 */

	describe('when logged in', function () {
		
		beforeEach(function () {
			return stubs.agentLogin(agent, credentials);
		})

		it('should allow me to query for specific request type: `reviewRequest`', function () {
			_test = this.test;

			return agent.post('/api/reviews')
				.send(review)
				.then(function () {
					var endpoint = '/api/requests?requestType=reviewRequest';

			return agent.get(endpoint)
				.expect(200)
				.query({ status: ['new', 'accepted'] })
				})
			
				.then(function (response) {
					log.debug({
						test: _test.title,
						body: response.body,
						err: response.error
					}, 'Got Response from %s', endpoint);

					response.body.should.have.length(1);

					return response.body;
				});
		});
	})

	 it('should be able to save Review instance if logged in', function (done) {
			log.debug({ func: 'save' }, 'Setup');
			// Get the userId
			var userId = user.id;

			// Save a new Review
			agent.post('/api/reviews')
				.send(review)
				.expect(200)
				.end(function (reviewSaveErr, reviewSaveRes) {
					// Handle Review save error
					if (reviewSaveErr) { done(reviewSaveErr); }

					// Get a list of Reviews
					return agent.get('/api/reviews')
						.end(function (reviewsGetErr, reviewsGetRes) {
							// Handle Review save error
							if (reviewsGetErr) { done(reviewsGetErr); }

							// Get Reviews list
							var reviews = reviewsGetRes.body;

							// Set assertions
							(reviews[0].user._id).should.equal(userId);
							(reviews[0].name).should.match('Review Name');

							// Call the assertion callback
							done();
						});
				});
	});
	/**
	 * End Stubs
	 */

	it('should not be able to save Review instance if not logged in', function (done) {
		agent.post('/api/reviews')
			.send(review)
			.expect(403)
			.end(function (reviewSaveErr, reviewSaveRes) {
				// Call the assertion callback
				done(reviewSaveErr);
			});
	});

	

	it('should not be able to save Review instance if no name is provided', function (done) {
		// Invalidate name field
		review.name = '';

		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function (signinErr, signinRes) {
				// Handle signin error
				if (signinErr) { done(signinErr); }

				// Get the userId
				var userId = user.id;

				// Save a new Review
				agent.post('/api/reviews')
					.send(review)
					.expect(400)
					.end(function (reviewSaveErr, reviewSaveRes) {
						// Set message assertion
						(reviewSaveRes.body.message).should.match('Please fill Review name');
						
						// Handle Review save error
						done(reviewSaveErr);
					});
			});
	});

	it('should be able to update Review instance if signed in', function (done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function (signinErr, signinRes) {
				// Handle signin error
				if (signinErr) { done(signinErr); }

				// Get the userId
				var userId = user.id;

				// Save a new Review
				agent.post('/api/reviews')
					.send(review)
					.expect(200)
					.end(function (reviewSaveErr, reviewSaveRes) {
						// Handle Review save error
						if (reviewSaveErr) { done(reviewSaveErr); }

						// Update Review name
						review.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Review
						agent.put('/api/reviews/' + reviewSaveRes.body._id)
							.send(review)
							.expect(200)
							.end(function (reviewUpdateErr, reviewUpdateRes) {
								// Handle Review update error
								if (reviewUpdateErr) { done(reviewUpdateErr); }

								// Set assertions
								(reviewUpdateRes.body._id).should.equal(reviewSaveRes.body._id);
								(reviewUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Reviews if not signed in', function (done) {
		// Create new Review model instance
		var reviewObj = new Review(review);

		// Save the Review
		reviewObj.save(function () {
			// Request Reviews
			request(app).get('/api/reviews')
				.end(function (req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Review if not signed in', function (done) {
		// Create new Review model instance
		var reviewObj = new Review(review);

		// Save the Review
		reviewObj.save(function () {
			request(app).get('/api/reviews/' + reviewObj._id)
				.end(function (req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', review.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Review instance if signed in', function (done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function (signinErr, signinRes) {
				// Handle signin error
				if (signinErr) { done(signinErr); }

				// Get the userId
				var userId = user.id;

				// Save a new Review
				agent.post('/api/reviews')
					.send(review)
					.expect(200)
					.end(function (reviewSaveErr, reviewSaveRes) {
						// Handle Review save error
						if (reviewSaveErr) { done(reviewSaveErr); }

						// Delete existing Review
						agent.delete('/api/reviews/' + reviewSaveRes.body._id)
							.send(review)
							.expect(200)
							.end(function (reviewDeleteErr, reviewDeleteRes) {
								// Handle Review error error
								if (reviewDeleteErr) { done(reviewDeleteErr); }

								// Set assertions
								(reviewDeleteRes.body._id).should.equal(reviewSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Review instance if not signed in', function (done) {
		// Set Review user 
		review.user = user;

		// Create new Review model instance
		var reviewObj = new Review(review);

		// Save the Review
		reviewObj.save(function () {
			// Try deleting Review
			request(app).delete('/api/reviews/' + reviewObj._id)
				.expect(403)
				.end(function (reviewDeleteErr, reviewDeleteRes) {
					// Set message assertion
					(reviewDeleteRes.body.message).should.match('User is not authorized');

					// Handle Review error error
					done(reviewDeleteErr);
				});

		});
	});

	afterEach(function (done) {
		User.remove().exec(function () {
			Review.remove().exec(function () {
				done();
			});
		});
	});
});
