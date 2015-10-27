'use strict';

var should = require('should'),
	Q = require('q'),
	_ = require('lodash'),
	request = require('supertest-as-promised')(Q.Promise),
	path = require('path'),
	express = require(path.resolve('./config/lib/express')),
	stubs = require(path.resolve('./config/lib/test.stubs')),
	TestAgent = require(path.resolve('./config/lib/test.agent')).TestAgent,
    log = require(path.resolve('./config/lib/logger')).child({
        module: 'tests',
        file: 'notifications.server.routes'
    });


var mongoose = require('mongoose'),
	User = mongoose.model('User');
	
	
// ** CONTROLLER TEST IMPORTS ** //

var NotificationCtrl = require(path.resolve('./modules/emailer/server/controllers/notifications.server.controller')),
	RequestMessage = mongoose.model('RequestMessage');


///////////////////////////////////

/**
 * Globals
 */
var app, agent, credentials, user, contactInfo;

var _test, endpoint;

/**
 * Notifications routes tests
 */
describe('Notifications CRUD tests', function () {
	before(function (done) {
		log.debug({ func: 'beforeAll' }, 'Setup Base');
		// Get application
		// app = express.init(mongoose);
		// agent = request.agent(app.http);
		
		//log.info({ testAgent: TestAgent, keys: _.keys(TestAgent)});
	
		agent = new TestAgent();
		log.info({ func: 'beforeAll', agent: agent, keys: _.keys(agent) });

		should.exist(agent.get);

		done();
	});

	beforeEach(function () {
		_test = this.currentTest;

		log.debug({ func: this.test.title, test: _test.title }, 'Setup');
		// Create user and credentials
        user = new User(stubs.user);
        credentials = stubs.getCredentials(user);

		// Save a user to the test db and create new Feed
		//return Q.all([user.save(), feed.save()]).then(
		return Q.all([user.save()]).then(
			function () {
				contactInfo = {};
				endpoint = '';
			});
	});

	describe('for the Controller', function () {

		var friendRequest;

		beforeEach(function () {
			friendRequest = new RequestMessage({
				"from": user._id,
				"contactInfo": {
					"checked": "true",
					"phoneNumbers": [
						"6507767675"
					],
					"emails": "",
					"displayName": "Patrick Test"
				},
				"requestType": "friendRequest",
				"status": "new",
				"to": null
			});
		});

		it('Should send an email for a new user');
		it('should send an email for a new friend invitation');
		it('should send an SMS for a new friend invitation', function () {

			return NotificationCtrl.processRequest(friendRequest, user)
				.then(function (sendResult) {
					should.exist(sendResult);

					log.debug({ func: 'Friend SMS Test', result: sendResult }, 'Got Result from Sending Friend Request');

					sendResult.should.have.property('success');
					sendResult.should.have.property('messageId');
					sendResult.should.have.property('status');
					sendResult.should.have.property('system');

					/Join the Convoy/.test(sendResult.message).should.be.true;
					/Terry has invited you/.test(sendResult.message).should.be.true;
				});
		});
		it('should send an SMS for an alternate format contact info', function () {
			var fr = new RequestMessage({
				"from": user._id,
				"contactInfo": {
					"emails": [
						{
							"value": "undefined"
						}
					],
					"phones": [
						{
							"type": "main",
							"value": "6507767675"
						}
					],
					"displayName": "undefined"
				},
				"requestType": "friendRequest"
			});

			return fr.save()
				.then(function (frResult) {
					return NotificationCtrl.processRequest(fr, user);
				})
				.then(function (sendResult) {
					should.exist(sendResult);

					log.debug({ func: 'Friend SMS Test', result: sendResult }, 'Got Result from Sending Friend Request');

					sendResult.should.have.property('success');
					sendResult.should.have.property('messageId');
					sendResult.should.have.property('status');
					sendResult.should.have.property('system');
					sendResult.should.have.property('recipient');
					
					/6507767675$/.test(sendResult.recipient).should.be.true;

					/Join the Convoy/.test(sendResult.message).should.be.true;
					/Terry has invited you/.test(sendResult.message).should.be.true;
				});
		})
		it('should send an email when a new friend request is accepted');
		it('should send an email when sharing a user\'s profile');

		afterEach(function () {
			return stubs.cleanTables([RequestMessage]);
		});
	});

	describe('for Logged In users', function () {

		function postToNotifications(postBody, expect, endpoint) {
			endpoint = endpoint || '/api/notifications';
			expect = expect || 200;

			return agent.post(endpoint)
				.send(postBody)
				.expect(expect)
				.then(
					function success(postResponse) {
						should.exist(postResponse.body);

						log.debug({ response: postResponse.body }, 'Got Response Body');

						return postResponse.body;
					});
		}

		beforeEach(function () {
			_test = this.currentTest;
			log.debug({ func: this.test.title, test: _test.title }, 'Setup');
			return agent.login(credentials);
		});

		it('should be able to send an SMS message to a mobile number', function () {
			contactInfo.phone = '6507767675';

			return postToNotifications(contactInfo, 200, '/api/notifications/sms').then(
				function (response) {
					response.should.have.property('message');
				});
		});
		
		
		//'user:new': {emailTemplate: 'sign-up-email', smsTemplate: null},
		it('should send a signup email when a new user is created');

		//'inviteRequest:send': {emailTemplate: 'invite-to-truckerline', smsTemplate: '{{FIRST_NAME}} has invited you to TruckerLine. Join the Convoy at http://app.truckerline.com/r/{{SHORT_ID}}'},
		it('should send an \'invite\' email when a user invtes another user with only an email address');
		it('should send an \'invite\' SMS/Text when a user invtes another user with only a phone number');
		it('should send an \'invite\' email and SMS when a user invites another with both email and phone number');

		//'friendRequest:send': {emailTemplate: 'new-friend-request', smsTemplate: null},

		//'friendRequest:accept': {emailTemplate: 'new-connection', smsTemplate: null},

		//'shareRequest:send': {emailTemplate: 'shared-profile-email', smsTemplate: null},

		//'shareRequest:accept': {emailTemplate: null, smsTemplate: null},

		//'reviewRequest:send': {emailTemplate: 'new-review-request', smsTemplate: '{{FIRST_NAME}} has requested you review their services on TruckerLine. http://app.truckerline.com/r/{{SHORT_ID}}'},

		//'reviewRequest:accept': { emailTemplate: 'new-review-posted', smsTemplate: null },

		//'chatMessage:new': { emailTemplate: 'new-message', smsTemplate: null },

		//'report-request:new': { emailTemplate: 'request-reminder', smsTemplate: null }


		afterEach(function () {
			log.debug({ func: 'afterEach' }, 'Signing Out of API');
			return agent.logout();
		});
	});

	afterEach(function () {
		log.debug({ func: 'afterEach' }, 'Cleanup');
		return stubs.cleanTables([User]);
	});


	after(function () {
		log.debug({ func: 'afterAll' }, 'FINAL Cleanup');
		return stubs.cleanTables([User]);
	});

});