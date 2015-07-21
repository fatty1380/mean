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
    ClientApp = mongoose.model('ClientApplication'),
    AccessToken = mongoose.model('AccessToken');
    
    

/**
 * Globals
 */
var app, agent, credentials, user, _test;

var client;


describe('Auth Routes tests', function () {
    before(function () {
        // Get application
        app = express.init(mongoose).http;
        agent = request.agent(app);

        client = new ClientApp({ name: 'TestCase', clientId: 'tc_01', clientSecret: 'shenanigans' });

        return client.save();
    });

    describe('JWT Tests', function () {

        beforeEach(function () {
            user = new User(stubs.user);
            credentials = stubs.getCredentials(user);

            return user.save();
        });

        it('should not be able to access any `api` routes without a token', function () {
            var _test = this.test;

            var endpoint = '/api/applications';

            return agent.post(endpoint)
                .send({ title: 'Unknown' })
                .expect(401)
                .then(function (response) {
                    log.debug({
                        test: _test.title,
                        body: response.body,
                        err: response.error
                    }, 'Got Response from %s', endpoint);


                });
        });

        it('should be able to get a token response with valid credentials', function () {
            var _test = this.test;

            var endpoint = '/oauth/token';
            var payload = _.extend(credentials, {
                grant_type: 'password',
                client_id: client.clientId,
                client_secret: client.clientSecret
            });

            return agent.post(endpoint)
                .send(payload)
                .expect(200)
                .then(function (response) {
                    log.debug({
                        test: _test.title,
                        body: response.body,
                        err: response.error
                    }, 'Got Response from %s', endpoint);

                    response.body.should.have.property('expires_in');
                });
        });

        // it('should get a 401 when supplying invalid credentials', function () {
        //     var _test = this.test;

        //     var endpoint = '/oauth/token';
        //     credentials.password = 'incorrect'

        //     return agent.post(endpoint)
        //         .send(credentials)
        //         .expect(401)
        //         .then(function (response) {
        //             log.debug({
        //                 test: _test.title,
        //                 body: response.body,
        //                 err: response.error
        //             }, 'Got Response from %s', endpoint);

        //             response.body.should.not.have.property('token');
        //         });
        // });
        
        
        describe('Authenticated JWT', function () {

            var token;

            beforeEach(function () {
                return stubs.getToken(agent, credentials, client).then(function (response) {
                    log.debug({ func: 'auth.before', token: response.body }, 'Got Token');
                    token = response.body;
                });
            })

            it('should have a token', function () {
                should.exist(token);
            });

            it('should return my user object', function () {
                var _test = this.test;
                var endpoint = '/api/users/me?access_token='+token.access_token;

                return agent.get(endpoint)
                    .set(token)
                    .expect(200)
                    .then(function (response) {
                        log.debug({
                            test: _test.title,
                            body: response.body,
                            err: response.error
                        }, 'Got Response from %s', endpoint);

                        var user = response.body;

                        user.should.have.property('firstName');
                    });
            });

        })

    });

    afterEach(function () {
        user = credentials = null;
        return stubs.cleanTables([User, 'AccessToken', 'RefreshToken']);
    });

    after(function () {
        return stubs.cleanTables([ClientApp]);
    })
});
