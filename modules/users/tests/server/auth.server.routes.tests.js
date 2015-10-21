'use strict';

var should = require('should'),
    _ = require('lodash'),
    Q = require('q'),
    path = require('path'),
    stubs = require(path.resolve('./config/lib/test.stubs')),
    TestAgent = require(path.resolve('./config/lib/test.agent')).TestAgent,
    express = require(path.resolve('./config/lib/express')),
    request = require('supertest-as-promised')(Q.Promise),
    log = require(path.resolve('./config/lib/logger')).child({
        module: 'user',
        file: 'user.server.routes.test'
    });

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Driver = mongoose.model('Driver'),
    ClientApp = mongoose.model('ClientApplication'),
    AccessToken = mongoose.model('AccessToken');
    
    

/**
 * Globals
 */
var app, agent, credentials, user, _test;

var jwtConfig, config;


describe('Auth Routes tests', function () {
    before(function (done) {
        // Get application
        
        log.error({ func: 'beforeAll' }, 'Enabling JWT Auth');
        
        // config = require(path.resolve('./config/config'));
        // jwtConfig = config.security.enableJWT;
        // config.security.enableJWT = true;
        
        // app = express.init(mongoose).http;
        // agent = request.agent(app);
        agent = new TestAgent();
        
        should.exist(agent.get);
        
        done();


        //client = new ClientApp({ name: 'TestCase', clientId: 'tc_01', clientSecret: 'shenanigans' });

        //return client.save();
    });

    describe('JWT Tests', function () {

        beforeEach(function () {
            user = new Driver(stubs.user);
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
            
            return agent.login(credentials, { rawResponse: true, expect: 200 })
                .then(function (response) {
                    log.debug({
                        test: _test.title,
                        body: response.body,
                        err: response.error
                    }, 'Got Response from %s', endpoint);

                    response.body.should.have.property('expires_in');
                });
        });

        it('should get a 401 when supplying invalid credentials', function () {
            var _test = this.test;

            var endpoint = '/oauth/token';
            credentials.password = 'incorrect';

            return agent.login(credentials, { rawResponse: true, expect: 401 })
                .then(function (response) {
                    log.debug({
                        test: _test.title,
                        body: response.body,
                        err: response.error
                    }, 'Got Response from %s', endpoint);

                    response.body.should.not.have.property('access_token');
                });
        });


        describe('Authenticated JWT', function () {

            var token;

            beforeEach(function () {
                
                return agent.login(credentials, { rawResponse: true }).then(function (response) {
                    log.debug({ func: 'auth.before', body: response.body }, 'Got Token');
                    token = response.body;
                });
            });

            it('should have a token', function () {
                should.exist(token);
            });

            it('should return my user object', function () {
                var _test = this.test;
                var endpoint = '/api/users/me';

                return agent.get(endpoint)
                    .set({ 'x-access_token': token.access_token })
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

            it('should return a list of profiles', function () {
                var _test = this.test;
                var endpoint = '/api/profiles';

                return agent.get(endpoint)
                    .set({ 'x-access_token': token.access_token })
                    .expect(200)
                    .then(function (response) {
                        log.debug({
                            test: _test.title,
                            body: response.body,
                            err: response.error
                        }, 'Got Response from %s', endpoint);

                        _.isArray(response.body).should.be.true;
                    });
            });

            it('should return a profile object', function () {
                var _test = this.test;
                var endpoint = '/api/profiles/' + user.id + '';

                return agent.get(endpoint)
                    .set({ 'x-access_token': token.access_token })
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


            it('should allow me to update my user', function () {
                var _test = this.test;
                var endpoint = '/api/users';

                var data = {
                    'handle': 'gearjammer',
                    'about': 'I bet you think this test is about you'
                };

                return agent.put(endpoint)
                    .set({ 'x-access_token': token.access_token })
                    .send(data)
                    .expect(200)
                    .then(function (response) {
                        log.debug({
                            test: _test.title,
                            body: response.body,
                            err: response.error
                        }, 'Got Response from %s', endpoint);

                        var user = response.body;

                        user.should.have.property('handle', data.handle);
                        user.should.have.property('about', data.about);

                        user.should.have.property('id', user.id);
                    });
            });
        });

    });

    afterEach(function () {
        user = credentials = null;
        return stubs.cleanTables([User]); //, 'AccessToken', 'RefreshToken']);
    });

    after(function () {
        //config.security.enableJWT = jwtConfig;
        return stubs.cleanTables([ClientApp]);
    });
});
