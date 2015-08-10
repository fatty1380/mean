'use strict';

var should = require('should'),
	request = require('supertest'),
	path = require('path'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Message = mongoose.model('Message'),
	express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, message;

/**
 * Message routes tests
 */
describe('Message CRUD tests', function() {
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

		// Save a user to the test db and create new Message
		user.save(function() {
			message = {
				name: 'Message Name'
			};

			done();
		});
	});

	it('should be able to save Message instance if logged in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Message
				agent.post('/api/messages')
					.send(message)
					.expect(200)
					.end(function(messageSaveErr, messageSaveRes) {
						// Handle Message save error
						if (messageSaveErr) done(messageSaveErr);

						// Get a list of Messages
						agent.get('/api/messages')
							.end(function(messagesGetErr, messagesGetRes) {
								// Handle Message save error
								if (messagesGetErr) done(messagesGetErr);

								// Get Messages list
								var messages = messagesGetRes.body;

								// Set assertions
								(messages[0].user._id).should.equal(userId);
								(messages[0].name).should.match('Message Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Message instance if not logged in', function(done) {
		agent.post('/api/messages')
			.send(message)
			.expect(403)
			.end(function(messageSaveErr, messageSaveRes) {
				// Call the assertion callback
				done(messageSaveErr);
			});
	});

	it('should not be able to save Message instance if no name is provided', function(done) {
		// Invalidate name field
		message.name = '';

		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Message
				agent.post('/api/messages')
					.send(message)
					.expect(400)
					.end(function(messageSaveErr, messageSaveRes) {
						// Set message assertion
						(messageSaveRes.body.message).should.match('Please fill Message name');
						
						// Handle Message save error
						done(messageSaveErr);
					});
			});
	});

	it('should be able to update Message instance if signed in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Message
				agent.post('/api/messages')
					.send(message)
					.expect(200)
					.end(function(messageSaveErr, messageSaveRes) {
						// Handle Message save error
						if (messageSaveErr) done(messageSaveErr);

						// Update Message name
						message.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Message
						agent.put('/api/messages/' + messageSaveRes.body._id)
							.send(message)
							.expect(200)
							.end(function(messageUpdateErr, messageUpdateRes) {
								// Handle Message update error
								if (messageUpdateErr) done(messageUpdateErr);

								// Set assertions
								(messageUpdateRes.body._id).should.equal(messageSaveRes.body._id);
								(messageUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Messages if not signed in', function(done) {
		// Create new Message model instance
		var messageObj = new Message(message);

		// Save the Message
		messageObj.save(function() {
			// Request Messages
			request(app).get('/api/messages')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Message if not signed in', function(done) {
		// Create new Message model instance
		var messageObj = new Message(message);

		// Save the Message
		messageObj.save(function() {
			request(app).get('/api/messages/' + messageObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', message.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Message instance if signed in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Message
				agent.post('/api/messages')
					.send(message)
					.expect(200)
					.end(function(messageSaveErr, messageSaveRes) {
						// Handle Message save error
						if (messageSaveErr) done(messageSaveErr);

						// Delete existing Message
						agent.delete('/api/messages/' + messageSaveRes.body._id)
							.send(message)
							.expect(200)
							.end(function(messageDeleteErr, messageDeleteRes) {
								// Handle Message error error
								if (messageDeleteErr) done(messageDeleteErr);

								// Set assertions
								(messageDeleteRes.body._id).should.equal(messageSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Message instance if not signed in', function(done) {
		// Set Message user 
		message.user = user;

		// Create new Message model instance
		var messageObj = new Message(message);

		// Save the Message
		messageObj.save(function() {
			// Try deleting Message
			request(app).delete('/api/messages/' + messageObj._id)
			.expect(403)
			.end(function(messageDeleteErr, messageDeleteRes) {
				// Set message assertion
				(messageDeleteRes.body.message).should.match('User is not authorized');

				// Handle Message error error
				done(messageDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec(function(){
			Message.remove().exec(function(){
				done();
			});
		});
	});
});
