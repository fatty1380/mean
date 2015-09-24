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
        file: 'user.connections.server.routes.test'
    });

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    RequestMessage = mongoose.model('RequestMessage');

/**
 * Globals
 */
var app, agent, credentials, user, _test;


describe('User Connections & Social', function () {
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
                text: 'Yes man - be my buddy',
                status: 'accepted'
            });
            user.requests.push(r1);
            u1.requests.push(r1);

            // U2 Has Requested User
            r2 = new RequestMessage({
                from: u2,
                to: user,
                text: 'Yo! Will you join my convoy?'
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
                    friends[0].should.have.property('handle');
                    friends[0].should.have.property('displayName');
                    friends[0].should.have.property('profileImageURL');

                    friends[0].should.have.property('friends')
                        .and.be.instanceof(Array)
                        .and.containEql(user.id)
                        .and.have.length(1);

                    friends[0].should.not.have.property('email');
                    friends[0].should.not.have.property('phone');
                    friends[0].should.not.have.property('provider');
                    friends[0].should.not.have.property('username');
                    friends[0].should.not.have.property('password');
                    friends[0].should.not.have.property('salt');
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

                    log.debug({ 
                        test: _test.title, 
                        endpoint: endpoint, 
                        u1: u1.id,
                        u2: u2.id, 
                        user: user.id },
                        'Logging Relevant User IDs');

                    friends.should.have.property('length', 1);
                    friends[0].should.have.property('id', user.id);
                    friends[0].should.have.property('handle');
                    friends[0].should.have.property('displayName');
                    friends[0].should.have.property('profileImageURL');

                    friends[0].should.have.property('friends')
                        .and.be.instanceof(Array)
                        .and.containEql(u1.id)
                        .and.have.length(1);

                    friends[0].should.not.have.property('email');
                    friends[0].should.not.have.property('phone');
                    friends[0].should.not.have.property('provider');
                    friends[0].should.not.have.property('username');
                    friends[0].should.not.have.property('password');
                    friends[0].should.not.have.property('salt');
                });
        });

        it('should return no friends for u2', function () {
            _test = this.test;

            var endpoint = '/api/users/' + u2.id + '/friends';
            return agent.get(endpoint)
                .expect(200)
                .then(function (response) {
                    log.debug({
                        test: _test.title,
                        body: response.body,
                        err: response.error
                    }, 'Got Response from %s', endpoint);
                    
                    var friends = response.body;

                    log.debug({ 
                        test: _test.title, 
                        endpoint: endpoint, 
                        u1: u1.id,
                        u2: u2.id, 
                        user: user.id },
                        'Logging Relevant User IDs');

                    friends.should.have.property('length', 0);
                });
        });

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
        
        it('should allow me to query for specific request type: `friendRequest`', function () {
            _test = this.test;

            var endpoint = '/api/requests?requestType=friendRequest';

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
            var postData = { to: u3.id, text: 'hello there!' };
            
            log.debug({ url: endpoint, test: _test.title, postData: postData }, 'Posting Friend Request');

            return agent.post(endpoint)
                .send(postData)
                .expect(200)
                .then(function (response) {
                    var friendRequest = response.body;

                    log.debug({ url: endpoint, test: _test.title, body: response.body, code: response.status }, 'Got friends result');

                    friendRequest.should.have.property('text', postData.text);
                    friendRequest.should.have.property('from', user.id);
                    friendRequest.should.have.property('to', u3.id);
                    friendRequest.should.have.property('status', 'new');
                });
        });

        it('should allow me to include my own ID in the request', function () {
            _test = this.test;

            var endpoint = '/api/requests';
            var postData = { from: user.id, to: u3.id, text: 'hello there!' };
            
            log.debug({ url: endpoint, test: _test.title, postData: postData }, 'Posting Friend Request');

            return agent.post(endpoint)
                .send(postData)
                .expect(200)
                .then(function (response) {
                    var friendRequest = response.body;

                    log.debug({ url: endpoint, test: _test.title, body: response.body, code: response.status }, 'Got friends result');

                    friendRequest.should.have.property('text', postData.text);
                    friendRequest.should.have.property('from', user.id);
                    friendRequest.should.have.property('to', u3.id);
                    friendRequest.should.have.property('status', 'new');
                });
        });
        
        it('should allow me to make a friend request of a non-outset user', function () {
            _test = this.test;

            var endpoint = '/api/requests';
            var contactInfo = {
                displayName: 'Calamity Jane',
                email: 'c.jane@deadwoodpost.com',
                phones: [{ main: '123-456-7689' }]
            };
            var postData = { contactInfo: contactInfo, text: 'hello there!' };

            log.debug({ url: endpoint, test: _test.title, postData: postData }, 'Posting Friend Request');

            return agent.post(endpoint)
                .send(postData)
                .expect(200)
                .then(function (response) {
                    var friendRequest = response.body;

                    log.debug({ url: endpoint, test: _test.title, body: response.body, code: response.status }, 'Got friends result');

                    friendRequest.should.have.property('text', postData.text);
                    friendRequest.should.have.property('from', user.id);
                    friendRequest.should.have.property('to', null);
                    friendRequest.should.have.property('contactInfo', contactInfo);
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
            _test = this.test;

            var endpoint = '/api/requests/' + r2.id;

            return agent.put(endpoint)
                .send({ action: 'reject' })
                .expect(200)
                .then(
                    function (response) {
                        log.debug({
                            test: _test.title,
                            section: 'test put',
                            body: response.body,
                            err: response.error
                        }, 'Got Response from %s', endpoint);

                        response.body.should.have.property('status', 'rejected');

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
                            friends.should.not.be.empty();

                            var notFriend = _.find(friends, { id: u2.id });
                            should.not.exist(notFriend);
                        });
        });
        it('should allow the user to remove an existing friend', function () {
            var endpoint = '/api/friends/' + u1.id;
            
            return agent.delete(endpoint)
                .expect(200)
                .then(
                    function (response) {
                        log.debug({
                            test: _test.title,
                            section: 'test delete',
                            body: response.body,
                            err: response.error
                        }, 'Got Response from %s', endpoint);

                        response.body.should.have.property('status', 'rejected');

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
                            friends.should.not.be.empty();

                            var oldFriend = _.find(friends, { id: u1.id });
                            should.not.exist(oldFriend);
                        });
        });
        
        /// Maybe this is best handled on the server side, silently?
        /// TODO: Determine how this use case should be handled
        it('should prevent re-sending of a deleted/rejected friend request? Maybe?', function () {
            var endpoint = '/api/';
        });
    });


    afterEach(function () {

        return stubs.agentLogout(agent)
            .then(function () {
                log.trace('Logged out of app');
                return stubs.cleanTables([User, RequestMessage]);
            });
    });
});

