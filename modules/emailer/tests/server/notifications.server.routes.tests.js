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
        file: 'notifications.server.routes'
    });


var mongoose = require('mongoose'),
	User = mongoose.model('User');

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
		app = express.init(mongoose);
		agent = request.agent(app.http);

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

	describe('for Logged In users', function () {

		beforeEach(function () {
			_test = this.currentTest;
			log.debug({ func: this.test.title, test: _test.title }, 'Setup');
			return stubs.agentLogin(agent, credentials);
		});

		it('should be able to send an SMS message to a mobile number', function () {
			contactInfo.phone = '6507767675';

			endpoint = '/api/notifications/sms';

			return agent.post(endpoint)
				.send(contactInfo)
				.expect(200)
				.then(
				function success(smsResponse) {
					log.debug({ test: _test.title, response: smsResponse }, 'Got SMS Response');
						should.exist(smsResponse.body);

						log.debug({ response: smsResponse.body }, 'Got SMS Response Message');
				},
				function failure(err) {
					log.error({ test: _test.title, err: err }, 'SMS Response Failed');
					
					should.not.exist(err);
				});
		});


		afterEach(function (done) {
			log.debug({ func: 'afterEach' }, 'Signing Out of API');
			agent.get('/api/auth/signout').expect(302).then(function (signoutRes) {
				log.trace({ signoutRes: signoutRes }, 'signed out of app');
				done();
			});
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