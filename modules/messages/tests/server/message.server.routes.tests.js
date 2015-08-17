'use strict';

var should = require('should'),
	Q = require('q'),
	_ = require('lodash'),
	request = require('supertest-as-promised')(Q.Promise),
	path = require('path'),
	express = require(path.resolve('./config/lib/express')),
	stubs = require(path.resolve('./config/lib/test.stubs')),
    log = require(path.resolve('./config/lib/logger')).child({
        module: 'tests',
        file: 'message.server.routes'
    });

var mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Message = mongoose.model('Message');
	
/**
 * Globals
 */
var app, agent, credentials, user, recipient, message, _test;

/**
 * Message routes tests
 */
describe('Message CRUD tests', function () {
	before(function (done) {
		// Get application
		app = express.init(mongoose);
		agent = request.agent(app.http);

		done();
	});

	beforeEach(function () {
		_test = this.test;
		
		// Create user credentials
		user = new User(stubs.user);
        credentials = stubs.getCredentials(user);

		recipient = new User(stubs.getUser());
		
		// Save a user to the test db and create new Message
		return Q.all([user.save(), recipient.save()])
			.then(
				function (success) {
					log.info({ test: _test.title, func: 'beforeEach', success: success }, 'Saved User & Recipient to DB');
					
					user = success[0];
					recipient = success[1];
					
					message = {
						sender: user,
						recipient: recipient,
						text: 'This is a Message!'
					};
				});
	});

	describe('When logged in', function () {
		var userId, recipId;

		beforeEach(function () {
			return stubs.agentLogin(agent, credentials)
				.then(function (response) {
					
					// Save the userId
					userId = user.id;
					recipId = recipient.id;
				});
		});
		
		afterEach(function () {
			return stubs.agentLogout(agent);
		});

		it('should be able to save a basic message', function () {
			
			// Save a new Message
			return agent.post('/api/messages')
				.send(message)
				.expect(200)
				.then(function (messageSaveRes) {

					log.info({ test: _test.title, response: messageSaveRes }, 'Posted Message');

					messageSaveRes.should.have.property('body');
					messageSaveRes.body.should.have.property('sender');
					messageSaveRes.body.should.have.property('recipient');
					messageSaveRes.body.should.have.property('status');
						
					// Get a list of Messages
					return agent.get('/api/messages');
				})
				.then(function (messagesGetRes) {

					log.info({ test: _test.title, response: messagesGetRes.body, keys: _.keys(messagesGetRes.body) }, 'Got Messages');

					// Get Messages list
					var messages = messagesGetRes.body;
					
					// Set assertions
					(messages[0].sender._id).should.equal(userId);
					(messages[0].text).should.match('This is a Message!');
				});
		});

		it('should get a list of chats grouped by other party', function () {
						// Save a new Message
			return agent.post('/api/messages')
				.send(message)
				.expect(200)
				.then(function (messageSaveRes) {

					log.info({ test: _test.title, response: messageSaveRes }, 'Posted Message');

					messageSaveRes.should.have.property('body');
					messageSaveRes.body.should.have.property('sender');
					messageSaveRes.body.should.have.property('recipient');
					messageSaveRes.body.should.have.property('status');
						
					// Get a list of Messages
					return agent.get('/api/messages?grouped=true');
				})
				.then(function (messagesGetRes) {

					log.info({ test: _test.title, response: messagesGetRes.body}, 'Got Messages');

					// Get Messages list
					var groups = messagesGetRes.body;
					
					groups.should.have.length(1);
					
					var messages = groups[0];
					
					// Set assertions
					(messages[0].sender._id).should.equal(userId);
					(messages[0].text).should.match('This is a Message!');
					(messages[0].sender).should.not.have.property('password');
					(messages[0].sender).should.not.have.property('salt');
				});
		});

		it('should be able to update Message instance', function (done) {
		
			// Save a new Message
			agent.post('/api/messages')
				.send(message)
				.expect(200)
				.end(function (messageSaveErr, messageSaveRes) {
					// Handle Message save error
					if (messageSaveErr) done(messageSaveErr);

					// Update Message name
					message.text = 'WHY YOU GOTTA BE SO MEAN?';

					// Update existing Message
					agent.put('/api/messages/' + messageSaveRes.body._id)
						.send(message)
						.expect(200)
						.end(function (messageUpdateErr, messageUpdateRes) {
							// Handle Message update error
							if (messageUpdateErr) done(messageUpdateErr);

							// Set assertions
							(messageUpdateRes.body._id).should.equal(messageSaveRes.body._id);
							(messageUpdateRes.body.text).should.match('WHY YOU GOTTA BE SO MEAN?');

							// Call the assertion callback
							done();
						});
				});
		});

		it('should be able to delete Message instance', function (done) {
		

			// Save a new Message
			agent.post('/api/messages')
				.send(message)
				.expect(200)
				.end(function (messageSaveErr, messageSaveRes) {
					// Handle Message save error
					if (messageSaveErr) done(messageSaveErr);

					// Delete existing Message
					agent.delete('/api/messages/' + messageSaveRes.body._id)
						.send(message)
						.expect(200)
						.end(function (messageDeleteErr, messageDeleteRes) {
							// Handle Message error error
							if (messageDeleteErr) done(messageDeleteErr);

							// Set assertions
							(messageDeleteRes.body._id).should.equal(messageSaveRes.body._id);

							// Call the assertion callback
							done();
						});
				});
		});

		it('should not be able to save Message instance if no message text is provided', function (done) {
			// Invalidate name field
			message.text = '';

		
			// Save a new Message
			agent.post('/api/messages')
				.send(message)
				.expect(400)
				.end(function (messageSaveErr, messageSaveRes) {
					// Set message assertion
					(messageSaveRes.body.message).should.match('Please enter a message');
						
					// Handle Message save error
					done(messageSaveErr);
				});
		});
	});





	describe('when not signed in,', function () {
		it('should not be able to get a list of Messages', function (done) {
			// Create new Message model instance
			var messageObj = new Message(message);

			// Save the Message
			messageObj.save(function () {
				// Request Messages
				agent.get('/api/messages')
					.expect(401)
					.end(function (req, res) {
						// Set assertion
						res.should.have.property('error');

						// Call the assertion callback
						done();
					});

			});
		});

		it('should not be able to save Message instance', function (done) {
			agent.post('/api/messages')
				.send(message)
				.expect(403)
				.end(function (messageSaveErr, messageSaveRes) {
					// Call the assertion callback
					done(messageSaveErr);
				});
		});


		it('should not be able to get a single Message', function (done) {
			// Create new Message model instance
			var messageObj = new Message(message);

			// Save the Message
			messageObj.save(function () {
				agent.get('/api/messages/' + messageObj._id)
					.expect(401)
					.end(function (req, res) {
						log.debug({ resBody: res.body, error: res.error, req: req })
						// Set assertion
						
						// Call the assertion callback
						done();
					});
			});
		});

		it('should not be able to delete Message instance', function (done) {
			// Set Message user 
			message.user = user;

			// Create new Message model instance
			var messageObj = new Message(message);

			// Save the Message
			messageObj.save(function () {
				// Try deleting Message
				agent.delete('/api/messages/' + messageObj._id)
					.expect(403)
					.end(function (messageDeleteErr, messageDeleteRes) {
						// Set message assertion
						(messageDeleteRes.body.message).should.match('User is not authorized');

						// Handle Message error error
						done(messageDeleteErr);
					});

			});
		});

	});







	afterEach(function () {
		return stubs.cleanTables([User, Message]);
	});
});
