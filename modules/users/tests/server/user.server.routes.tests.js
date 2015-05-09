'use strict';

var should = require('should'),
    Q = require('q'),
    path = require('path'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    SeedUser = mongoose.model('SeedUser'),
    express = require(path.resolve('./config/lib/express')),
    request = require('supertest-as-promised')(Q.Promise),
    log = require(path.resolve('./config/lib/logger')).child({
        module: 'article.routes.test',
        file: 'article.server.routes.test'
    });

/**
 * Globals
 */
var app, agent, credentials, user, seeduser;


describe('Seed User CRUD tests', function () {
    before(function (done) {
        // Get application
        app = express.init(mongoose).http;
        agent = request.agent(app);

        done();
    });

    beforeEach(function (done) {
        seeduser = {
            firstName: 'Signup',
            lastName: 'User',
            email: 'signuponly@seed.com'
        };

        done();
    });

    it('Should allow me to create a basic seed user', function (done) {
        agent.post('/api/seed')
            .send(seeduser)
            .expect(200)
            .then(function (seedResponse) {
                log.debug({response: seedResponse.body}, 'Got Response');

                seedResponse.should.have.property('body');

                var newSeed = seedResponse.body;

                newSeed.should.have.property('_id');
                newSeed.should.have.property('firstName', seeduser.firstName);
                newSeed.should.have.property('lastName', seeduser.lastName);
                newSeed.should.have.property('email', seeduser.email);

                done();
            }, done);
    });

    it('Should not allow me to create a seed user for an email that is already seeded', function (done) {
        this.timeout(5000);

        agent.post('/api/seed')
            .send(seeduser)
            .expect(200)
            .then(function (seedResponse) {

                return agent.post('/api/seed')
                    .send(seeduser)
                    .expect(400);
            })
            .then(function (response) {
                log.debug('Got response from dupe seed user');

                response.should.have.property('error');
                response.error.should.have.property('text');

                done();
            })
            .catch(function (err) {
                log.debug(err, 'Got ERR response creating seed user');

                should.not.exist(err);

                done();
            });
    });

    afterEach(function (done) {
        SeedUser.remove().exec(function () {
            done();
        });
    });
});


