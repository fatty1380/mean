'use strict';

var should = require('should'),
    _ = require('lodash'),
    Q = require('q'),
    path = require('path'),
    stubs = require(path.resolve('./config/lib/test.stubs')),
    express = require(path.resolve('./config/lib/express')),
    request = require('supertest-as-promised')(Q.Promise),
    log = require(path.resolve('./config/lib/logger')).child({
        module: 'user',
        file: 'user.server.routes.test'
    });

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Driver = mongoose.model('Driver'),
    RequestMessage = mongoose.model('RequestMessage');

/**
 * Globals
 */
var app, agent, credentials, user, _test;


describe('Driver CRUD tests', function () {
    before(function (done) {
        // Get application
        app = express.init(mongoose).http;
        agent = request.agent(app);

        done();
    });

    beforeEach(function () {
        user = new Driver(stubs.user);
        credentials = stubs.getCredentials(user);
		return user.save();
    });

    describe('When logged in', function () {

		var loggedInUser = null;

        beforeEach(function () {
            return stubs.agentLogin(agent, credentials).then(function (success) {
				loggedInUser = success;
			});
		});

		it('should load my user when requested', function () {
			_test = this.test;
			var endpoint = '/api/users/me';

			return agent.get(endpoint)
				.expect(200)
				.then(function (response) {
					log.debug({
						test: _test.title,
						body: response.body,
						err: response.error
					}, 'Got Response from %s', endpoint);

					response.body.should.have.property('id', user.id);
				});
		});

		var attrs = {
			'handle': 'gearjammer',
			'about': 'this is about you',
			'license': {
				'class': 'A',
				'endorsements': ['H'],
				'state': 'CA'
			}
		};

		_.each(_.keys(attrs), function (key) {
			it('should be able to set the driver\'s ' + key, function () {
				_test = this.test;
				var endpoint = '/api/users';

				var data = {};
				data[key] = attrs[key];

				log.debug({
					test: _test.title,
					data: data
				}, 'Sending JSON data to %s', endpoint);

				return agent.put(endpoint)
					.send(data)
					.expect(200)
					.then(function (response) {
						log.debug({
							test: _test.title,
							body: response.body,
							err: response.error
						}, 'Got Response from %s', endpoint);

						response.body.should.have.property(key, attrs[key]);

					});
			});
		});

		it('should be able to set the driver\'s props', function () {
			_test = this.test;
			var endpoint = '/api/users/me/props';

			var data = {
				'started': 1989,
				'truck': 'Kenworth',
				'trailers': ['Box Trailer', 'Curatin Side']
			};

			log.debug({
				test: _test.title,
				data: data
			}, 'Sending JSON data to %s', endpoint);

			return agent.put(endpoint)
				.send(data)
				.expect(200)
				.then(function (response) {
					log.debug({
						test: _test.title,
						body: response.body,
						err: response.error
					}, 'Got Response from %s', endpoint);

					_.each(_.keys(data), function (key) {
						var val = response.body[key];
						
						_.isEqual(val, data[key]).should.be.true;
					});

				});
		});
		
		

    });




    afterEach(function () {

        return agent.get('/api/auth/signout')
            .then(function () {
				log.trace('Logged out of app');
				return stubs.cleanTables([User]);
			});
    });
});
