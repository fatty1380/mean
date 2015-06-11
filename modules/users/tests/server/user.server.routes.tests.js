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

    describe('for creating, loading and rejecting friends', function () {
        var u1, u2, u3, r1, r2;
        beforeEach(function () {

            user = new User(user);
            u1 = new User(stubs.getUser());
            u2 = new User(stubs.getUser());
            u3 = new User(stubs.getUser());

            // User and U1 are Friends
            user.friends.push(u1.id);
            u1.friends.push(user.id);
            r1 = new RequestMessage({
                from: u1,
                to: user,
                message: 'Yes man - be my buddy',
                status: 'accepted'
            });
            user.requests.push(r1);
            u1.requests.push(r1);

            // U2 Has Requested User
            r2 = new RequestMessage({
                from: u2,
                to: user,
                message: 'Yo! Will you join my convoy?'
            });
            user.requests.push(r2);
            u2.requests.push(r2);

            credentials.username = user.username;

            var promises = _.map([user, u1, u2, u3, r1, r2],
                function (dbm) { return dbm.save(); });

            return Q.all(promises)
                .then(function () {
                return stubs.agentLogin(agent, credentials);
            });
        });

        /** Initial State
         *  user    friends requests:sent
         *  ---------------------------
         *  user    u1      
         *  u1      user    r1:user:acc
         *  u2      user    r2:user:new
         *  u3      -       -
         */

        it('should return one friend for `user`', function () {
            _test = this.test;

            var endpoint = '/api/friends';
            return agent.get(endpoint)
                .expect(200)
                .then(function (response) {
                log.debug({
                    test: _test.title,
                    body: response.body,
                    err: response.error
                }, 'Got Response from %s', endpoint);
                var friends = response.body;

                friends.should.have.property('length', 1);
                friends[0].should.have.property('id', u1.id);
            });
        });

        it('should return correct friend status', function () {
            _test = this.test;

            var endpoint = '/api/friends/' + u1.id;
            return agent.get(endpoint)
                .expect(200)
                .then(function (response) {
                log.debug({
                    test: _test.title,
                    body: response.body,
                    err: response.error
                }, 'Got Response from %s', endpoint);

                response.body.should.have.property('status', 'friends');
                
                //////////////
                
                endpoint = '/api/friends/' + u2.id;
                return agent.get(endpoint)
                    .expect(200);
            })
                .then(function (response) {
                log.debug({
                    test: _test.title,
                    body: response.body,
                    err: response.error
                }, 'Got Response from %s', endpoint);

                response.body.should.have.property('status', 'pending');
                
                //////////////
                
                endpoint = '/api/friends/' + u3.id;
                return agent.get(endpoint)
                    .expect(200);
            })
                .then(function (response) {
                log.debug({
                    test: _test.title,
                    body: response.body,
                    err: response.error
                }, 'Got Response from %s', endpoint);

                response.body.should.have.property('status', 'none');
                
                //////////////
                
                endpoint = '/api/friends/' + user.id;
                return agent.get(endpoint)
                    .expect(200);
            })
                .then(function (response) {
                log.debug({
                    test: _test.title,
                    body: response.body,
                    err: response.error
                }, 'Got Response from %s', endpoint);

                response.body.should.have.property('status', 'me');

            });
        });

        it('should return a list of friends for another user', function () {
            _test = this.test;

            var endpoint = '/api/users/' + u1.id + '/friends';
            return agent.get(endpoint)
                .expect(200)
                .then(function (response) {
                log.debug({
                    test: _test.title,
                    body: response.body,
                    err: response.error
                }, 'Got Response from %s', endpoint);
                var friends = response.body;

                log.debug({ test: _test.title, endpoint: endpoint, u1: u1.id, u2: u2.id, user: user.id }, 'Logging user IDs before failure');

                friends.should.have.property('length', 1);
                friends[0].should.have.property('id', user.id);
                friends[0].should.have.property('displayName');
            });
        });

        it('should return no friends for u2');

        it('should return a list of pending friend requests', function () {
            _test = this.test;

            var endpoint = '/api/requests';

            return agent.get(endpoint)
                .expect(200)
                .then(function (response) {
                log.debug({
                    test: _test.title,
                    body: response.body,
                    err: response.error
                }, 'Got Response from %s', endpoint);

                var requests = response.body;

                requests.should.have.length(1);
                requests[0].should.have.property('from', u2.id);

                return requests;
            });
        });
        it('should return a list of all friend requests when queried', function () {
            _test = this.test;

            var endpoint = '/api/requests';

            return agent.get(endpoint)
                .expect(200)
                .query({ status: ['new', 'accepted'] })
                .then(function (response) {
                log.debug({
                    test: _test.title,
                    body: response.body,
                    err: response.error
                }, 'Got Response from %s', endpoint);

                response.body.should.have.length(2);

                return response.body;
            });
        });

        it('should allow me to make a friend request and get that request back', function () {
            _test = this.test;

            var endpoint = '/api/requests';
            var postData = { friendId: u3.id };

            return agent.post(endpoint)
                .send(postData)
                .expect(200)
                .then(function (response) {
                var friendRequest = response.body;

                log.debug({ url: endpoint, test: _test.title, body: response.body, code: response.status }, 'Got friends result');

                friendRequest.should.have.property('message');
                friendRequest.should.have.property('from', user.id);
                friendRequest.should.have.property('to', u3.id);
                friendRequest.should.have.property('status', 'new');
            });
        });

        it('should allow me to load a specific friend request', function () {
            _test = this.test;

            var endpoint = '/api/requests/' + r1.id;

            log.debug({ test: _test.title }, 'Making call to get a friend request');

            return agent.get(endpoint)
                .expect(200).then(
                function (response) {
                    log.debug({
                        test: _test.title,
                        body: response.body,
                        err: response.error
                    }, 'Got Response from %s', endpoint);

                    var request = response.body;

                    request.should.have.property('to', user.id);
                    request.should.have.property('status', 'accepted');
                },
                function (err) {
                    log.debug({
                        test: _test.title,
                        error: err
                    }, 'Got Response from %s', endpoint);

                    should.not.exist(err);

                });
        });

        it('should allow the user to accept a friend request', function () {
            _test = this.test;

            var endpoint = '/api/requests/' + r2.id;

            return agent.put(endpoint)
                .send({ action: 'accept' })
                .expect(200)
                .then(
                function (response) {
                    log.debug({
                        test: _test.title,
                        section: 'test put',
                        body: response.body,
                        err: response.error
                    }, 'Got Response from %s', endpoint);

                    response.body.should.have.property('status', 'accepted');

                    return agent.get('/api/friends');
                }).then(
                function (response) {
                    log.debug({
                        test: _test.title,
                        section: 'verify added',
                        body: response.body,
                        err: response.error
                    }, 'Got Response from %s', endpoint);

                    var friends = response.body;
                    should.exist(friends);
                    friends.should.not.be.empty;

                    var newFriend = _.find(friends, { id: u2.id });
                    should.exist(newFriend);

                    log.debug({
                        test: _test.title,
                        section: 'verify added',
                        newFriend: newFriend
                    }, 'Got Response from %s', endpoint);

                    newFriend.should.have.property('friends');

                });
        });
        it('should allow the user to reject a friend request', function () {
            var endpoint = '/api/';
        });
        it('should allow the user to remove an existing friend', function () {
            var endpoint = '/api/';
        });
        it('should prevent re-sending of a deleted friend request?', function () {
            var endpoint = '/api/';
        });
    });


    afterEach(function () {

        return agent.get('/api/auth/signout')
            .then(function () {
            log.trace('Logged out of app');
            return stubs.cleanTables([User, RequestMessage]);
        });
    });
});


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
                /silverdog/i.test(result.username).should.be.true();
            });
        });
    });
    it('should be able to find users by handle');

    after(function () {
        return stubs.cleanTables([User]);
    });
});
