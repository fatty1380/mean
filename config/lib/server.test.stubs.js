'use strict';

var should = require('should'),
	Q = require('q'),
	_ = require('lodash'),
	path = require('path'),
	stubs = require(path.resolve('./config/lib/test.stubs')),
    log = require(path.resolve('./config/lib/logger')).child({
        module: 'tests',
        file: 'file.uploader'
    });
	


////////////////////////////////////////////////////////////////////////////////////
//		Controller Testing Stub													  //
////////////////////////////////////////////////////////////////////////////////////

var Controller = require(path.resolve('./modules/core/server/controllers/some.server.controller'));

/**
 * Globals
 */

var _test, endpoint;

describe('S3 File Access Tests', function () {
	before(function () {
		log.trace({ func: 'beforeAll' }, 'Setup Base');

		return Q.when(true);
	});

	beforeEach(function () {
		_test = this.currentTest;
		log.trace({ func: this.test.title, test: _test.title }, 'Setup');

		// Save a user to the test db and create new Feed
		//return Q.all([user.save(), feed.save()]).then(
		return Q.when(true);
	});

	afterEach(function () {
		log.trace({ func: this.test.title, test: _test.title }, 'Teardown');

		return Q.when(true);
	});


	after(function () {
		log.trace({ func: 'afterAll' }, 'All Tests Complete');

		return Q.when(true);
	});
});


////////////////////////////////////////////////////////////////////////////////////
//		Testing Routes Stub														  //
////////////////////////////////////////////////////////////////////////////////////

/**
 * Globals
 */
var agent, user, credentials;
var TestAgent = require(path.resolve('./config/lib/test.agent')).TestAgent;

/**
 * DB Models
 */
var mongoose = require('mongoose'),
	User = mongoose.model('User');

describe('S3 File Access Tests', function () {
	before(function () {
		log.trace({ func: 'beforeAll' }, 'Setup Base');

		agent = new TestAgent();
		should.exist(agent.get);

		return Q.when(true);
	});

	beforeEach(function () {
		_test = this.currentTest;
		log.trace({ func: this.test.title, test: _test.title }, 'Setup');

		// Create user and credentials
        user = new User(stubs.user);
        credentials = stubs.getCredentials(user);

		// Save a user to the test db and create new Feed
		//return Q.all([user.save(), feed.save()]).then(
		return Q.all([user.save()]).then(
			function () {
				// Initialize Test Pre-Conditions here	
			});
	});

	describe('When Logged in, ', function () {
		beforeEach(function () {
			return agent.login(credentials);
		});

		it('Should let me create a thing', function () {
			endpoint = '/api/something';
			var postBody = { name: 'something' };

			return agent.post(endpoint)
				.send(postBody)
				.expect(200)
				.then(
					function success(postResponse) {
						should.exist(postResponse.body);

						logResponse(_test, endpoint, response);

						var thing = postResponse.body;
						thing.should.have.property('shenanigans');

						return thing;
					});
		});

		afterEach(function () {
			return agent.logout();
		});
	});

	afterEach(function () {
		log.trace({ func: this.test.title, test: _test.title }, 'Teardown');

		return stubs.cleanTables([User]);
	});


	after(function () {
		log.trace({ func: 'afterAll' }, 'All Tests Complete');

		return Q.when(true);
	});
});

/////////////////////////////////////////////////////////////////////////////////////

function logResponse(test, endpoint, response) {

	log.debug({
		test: test.title,
		body: response.body,
		err: response.error
	}, 'Got Response from %s', endpoint);
}

/////////////////////////////////////////////////////////////////////////////////////