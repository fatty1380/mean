'use strict';

var should   = require('should'),
    _           = require('lodash'),
    Q        = require('q'),
    path     = require('path'),
    mongoose = require('mongoose'),
    stubs    = require(path.resolve('./config/lib/test.stubs')),
    User     = mongoose.model('User'),
    SeedUser = mongoose.model('SeedUser'),
    express  = require(path.resolve('./config/lib/express')),
    request  = require('supertest-as-promised')(Q.Promise),
    log      = require(path.resolve('./config/lib/logger')).child({
        module: 'article.routes.test',
        file  : 'article.server.routes.test'
    });

/**
 * Globals
 */
var app, agent, credentials, user, _test;


describe('User CRUD tests', function () {
    before(function (done) {
        // Get application
        app   = express.init(mongoose).http;
        agent = request.agent(app);

        done();
    });

    beforeEach(function () {
        user        = stubs.user;
        credentials = stubs.credentials;
    });

    describe('Profile specific tests', function () {

        beforeEach(function () {
            user = new User(user);

            return user.save();
        });

        it('should be able to load a profile by userId', function() {

            _test        = this.test;
            var endpoint = '/api/profiles/' + user.id;

            return agent.get(endpoint)
                .expect(200)
                .then(function (response) {
                    log.debug({
                        test: _test.title,
                        body: response.body,
                        err : response.error
                    }, 'Got Response from %s', endpoint);

                    response.body.should.have.property('id', user.id);
                });
        });
        it('should be able to load a profile by handle');
        it('should return a list of profiles without sensitive data', function () {
            _test        = this.test;
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
                        err : response.error
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
            _test        = this.test;
            var endpoint = '/api/profiles/' + user.id;

            return agent.get(endpoint)
                .expect(200)
                .then(function (response) {
                    log.debug({
                        test: _test.title,
                        body: response.body,
                        err : response.error
                    }, 'Got Response from %s', endpoint);

                    var profile = response.body;

                    profile.should.have.property('displayName');
                    profile.should.have.property('profileImageURL');

                    profile.should.not.have.property('salt');
                    profile.should.not.have.property('password');
                });
        });
    });

    describe('for creating, loading and rejecting friends', function () {
        var u1, u2;
        beforeEach(function () {

            user = new User(user);
            u1   = new User(stubs.getUser());
            u2   = new User(stubs.getUser());

            user.friends.push(u1.id);
            user.friends.push(u2.id);
            u1.friends.push(user.id);

            credentials.username = user.username;
            var token            = stubs.agentLogin(agent, credentials);

            return Q.all([user.save(), u1.save(), u2.save(), token]);
        });

        it('should return one friend for `user`', function () {
            _test        = this.test;
            var endpoint = '/api/users/me/friends';
            return agent.get(endpoint)
                .expect(200)
                .then(function (response) {
                    log.debug({
                        test: _test.title,
                        body: response.body,
                        err : response.error
                    }, 'Got Response from %s', endpoint);
                    var friends = response.body;

                    friends.should.have.property('length', 1);
                    return friends[0];
                })
                .then(function (friend) {
                    friend.should.have.property('username');
                    friend.should.have.property('profileImageURL');

                    friend.should.not.have.property('password');
                    friend.should.not.have.property('salt');
                });
        });
        it('should return no friends for u2');
    });


    afterEach(function () {
        return User.remove();
    });
});


