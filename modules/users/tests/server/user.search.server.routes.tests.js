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
    RequestMessage = mongoose.model('RequestMessage');

/**
 * Globals
 */
var app, agent, credentials, user, _test;

describe('User SEARCH tests', function () {
    before(function () {
        // Get application
        app = express.init(mongoose).http;
        agent = request.agent(app);
        credentials = stubs.credentials;

        this.timeout(10000);
        user = new User(stubs.user);

        return user.save()
            .then(function () {
                log.debug({ user: user }, 'Created base user');

                return stubs.populateStubUsers();
            })
            .then(function () {
                credentials.username = user.username;
                return stubs.agentLogin(agent, credentials);
            });
    });

    it('should have at least 100 users in the DB', function () {

        User.find().exec().then(function (results) {

            log.debug('There are %d users in the DB', results.length);
            results.should.have.length.gte(100);
        });
    });

    it('should be able to find users by first name', function () {
        var endpoint = '/api/profiles/search';

        return agent.get(endpoint)
            .expect(200)
            .query({ text: 'jimmie' })
            .then(function (response) {
                log.debug({ body: response.body }, 'Got a Response?');
                var results = response.body;
                results.should.have.property('length').and.be.greaterThan(0);

                _.first(results, function (result) {
                    result.should.have.property('firstName', 'jimmie');
                });
            });
    });
    it('should be able to find users by last name', function () {
        var endpoint = '/api/profiles/search';

        return agent.get(endpoint)
            .expect(200)
            .query({ text: 'burke' })
            .then(function (response) {
                var results = response.body;
                results.should.have.property('length').and.be.greaterThan(0);

                _.first(results, function (result) {
                    result.should.have.property('lastName', 'burke');
                });
            });
    });
    it('should be able to find users by first and last name', function () {
        var endpoint = '/api/profiles/search';

        return agent.get(endpoint)
            .expect(200)
            .query({ text: 'hugh burke' })
            .then(function (response) {
                var results = response.body;
                results.should.have.property('length').and.be.greaterThan(0);

                _.first(results, function (result) {
                    result.should.have.property('firstName', 'hugh');
                    result.should.have.property('lastName', 'burke');
                });
            });
    });
    it('should be able to find users by handle', function () {
        var endpoint = '/api/profiles/search';

        return agent.get(endpoint)
            .expect(200)
            .query({ text: 'silverdog' })
            .then(function (response) {
                var results = response.body;
                results.should.have.property('length').and.be.greaterThan(0);

                _.first(results, function (result) {
                    result.should.have.property('handle', 'silverdog');
                });
            });
    });
    it('should be able to find users by email name', function () {
        var endpoint = '/api/profiles/search';

        return agent.get(endpoint)
            .expect(200)
            .query({ text: 'katherine.simpson38@example.com' })
            .then(function (response) {
                var results = response.body;
                results.should.have.property('length').and.be.greaterThan(0);

                _.first(results, function (result) {
                    result.should.have.property('firstName', 'katherine');
                    result.should.have.property('lastName', 'simpson');
                });
            });
    });
    it('should be able to find users by exact username', function () {
        var endpoint = '/api/profiles/search';

        return agent.get(endpoint)
            .expect(200)
            .query({ text: 'silverdog702' })
            .then(function (response) {
                var results = response.body;
                results.should.have.property('length').and.be.greaterThan(0);

                _.first(results, function (result) {
                    result.should.have.property('username');
                    (/silverdog/i).test(result.username).should.be.true();
                });
            });
    });
    it('should be able to find users by handle');

    after(function () {
        return stubs.cleanTables([User]);
    });
});
