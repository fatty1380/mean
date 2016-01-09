'use strict';

var should = require('should'),
	request = require('supertest'),
	path = require('path'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	At = mongoose.model('At'),
	express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, at;

/**
 * At routes tests
 */
describe('At CRUD tests', function() {
	before(function(done) {
		// Get application
		app = express.init(mongoose);
		agent = request.agent(app);

		done();
	});

	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

		// Save a user to the test db and create new At
		user.save(function() {
			at = {
				name: 'At Name'
			};

			done();
		});
	});

	it('should be able to save At instance if logged in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new At
				agent.post('/api/ats')
					.send(at)
					.expect(200)
					.end(function(atSaveErr, atSaveRes) {
						// Handle At save error
						if (atSaveErr) done(atSaveErr);

						// Get a list of Ats
						agent.get('/api/ats')
							.end(function(atsGetErr, atsGetRes) {
								// Handle At save error
								if (atsGetErr) done(atsGetErr);

								// Get Ats list
								var ats = atsGetRes.body;

								// Set assertions
								(ats[0].user._id).should.equal(userId);
								(ats[0].name).should.match('At Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save At instance if not logged in', function(done) {
		agent.post('/api/ats')
			.send(at)
			.expect(403)
			.end(function(atSaveErr, atSaveRes) {
				// Call the assertion callback
				done(atSaveErr);
			});
	});

	it('should not be able to save At instance if no name is provided', function(done) {
		// Invalidate name field
		at.name = '';

		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new At
				agent.post('/api/ats')
					.send(at)
					.expect(400)
					.end(function(atSaveErr, atSaveRes) {
						// Set message assertion
						(atSaveRes.body.message).should.match('Please fill At name');
						
						// Handle At save error
						done(atSaveErr);
					});
			});
	});

	it('should be able to update At instance if signed in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new At
				agent.post('/api/ats')
					.send(at)
					.expect(200)
					.end(function(atSaveErr, atSaveRes) {
						// Handle At save error
						if (atSaveErr) done(atSaveErr);

						// Update At name
						at.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing At
						agent.put('/api/ats/' + atSaveRes.body._id)
							.send(at)
							.expect(200)
							.end(function(atUpdateErr, atUpdateRes) {
								// Handle At update error
								if (atUpdateErr) done(atUpdateErr);

								// Set assertions
								(atUpdateRes.body._id).should.equal(atSaveRes.body._id);
								(atUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Ats if not signed in', function(done) {
		// Create new At model instance
		var atObj = new At(at);

		// Save the At
		atObj.save(function() {
			// Request Ats
			request(app).get('/api/ats')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single At if not signed in', function(done) {
		// Create new At model instance
		var atObj = new At(at);

		// Save the At
		atObj.save(function() {
			request(app).get('/api/ats/' + atObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', at.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete At instance if signed in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new At
				agent.post('/api/ats')
					.send(at)
					.expect(200)
					.end(function(atSaveErr, atSaveRes) {
						// Handle At save error
						if (atSaveErr) done(atSaveErr);

						// Delete existing At
						agent.delete('/api/ats/' + atSaveRes.body._id)
							.send(at)
							.expect(200)
							.end(function(atDeleteErr, atDeleteRes) {
								// Handle At error error
								if (atDeleteErr) done(atDeleteErr);

								// Set assertions
								(atDeleteRes.body._id).should.equal(atSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete At instance if not signed in', function(done) {
		// Set At user 
		at.user = user;

		// Create new At model instance
		var atObj = new At(at);

		// Save the At
		atObj.save(function() {
			// Try deleting At
			request(app).delete('/api/ats/' + atObj._id)
			.expect(403)
			.end(function(atDeleteErr, atDeleteRes) {
				// Set message assertion
				(atDeleteRes.body.message).should.match('User is not authorized');

				// Handle At error error
				done(atDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec(function(){
			At.remove().exec(function(){
				done();
			});
		});
	});
});
