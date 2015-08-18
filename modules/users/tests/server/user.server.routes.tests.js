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


describe('User CRUD tests', function () {
    before(function (done) {
        // Get application
        app = express.init(mongoose).http;
        agent = request.agent(app);

        done();
    });

    beforeEach(function () {
        user = stubs.user;
        credentials = stubs.credentials;
    });

    describe('Profile specific tests', function () {

        beforeEach(function () {
            user = new User(user);

            return user.save();
        });

        it('should be able to load a profile by userId', function () {

            _test = this.test;
            var endpoint = '/api/profiles/' + user.id;

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
        it('should be able to load a profile by handle');
        it('should return a list of profiles without sensitive data', function () {
            _test = this.test;
            var endpoint = '/api/profiles';

            var admin = new User(stubs.getUser());
            admin.roles.push('admin');

            return admin.save()
                .then(function () {
                    credentials.username = admin.username;

                    return stubs.agentLogin(agent, credentials);
                })
                .then(function () {
                    return agent.get(endpoint)
                        .expect(200);
                })
                .then(function (response) {
                    log.debug({
                        test: _test.title,
                        body: response.body,
                        err: response.error
                    }, 'Got Response from %s', endpoint);

                    var profiles = response.body;

                    _.each(profiles, function (profile) {
                        profile.should.not.have.property('salt');
                        profile.should.not.have.property('password');
                    });
                    return true;
                });
        });
        it('should return profiles without sensitive fields', function () {
            _test = this.test;
            var endpoint = '/api/profiles/' + user.id;

            return agent.get(endpoint)
                .expect(200)
                .then(function (response) {
                    log.debug({
                        test: _test.title,
                        body: response.body,
                        err: response.error
                    }, 'Got Response from %s', endpoint);

                    var profile = response.body;

                    profile.should.have.property('displayName');
                    profile.should.have.property('profileImageURL');

                    profile.should.not.have.property('salt');
                    profile.should.not.have.property('password');
                });
        });
    });

    afterEach(function () {

        return stubs.signout(agent)
            .then(function () {
                log.trace('Logged out of app');
                return stubs.cleanTables([User, RequestMessage]);
            });
    });
});