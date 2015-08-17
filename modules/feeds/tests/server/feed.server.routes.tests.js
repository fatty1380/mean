'use strict';

var should = require('should'),
	Q = require('q'),
	_ = require('lodash'),
	request = require('supertest-as-promised')(Q.Promise),
	path = require('path'),
	express = require(path.resolve('./config/lib/express')),
	stubs = require(path.resolve('./config/lib/test.stubs')),
    log = require(path.resolve('./config/lib/logger')).child({
        module: 'tests',
        file: 'feed.server.routes'
    });


var mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Feed = mongoose.model('Feed'),
	FeedItem = mongoose.model('FeedItem');

/**
 * Globals
 */
var app, agent, credentials, user, feedItem;

/**
 * Feed routes tests
 */
describe('Feed CRUD tests', function () {
	before(function (done) {
		log.debug({ func: 'beforeAll' }, 'Setup Base');
		// Get application
		app = express.init(mongoose);
		agent = request.agent(app.http);

		done();
	});

	beforeEach(function () {
		log.debug({ func: 'beforeEach' }, 'Setup');
		// Create user and credentials
        user = new User(stubs.user);
        credentials = stubs.getCredentials(user);

		// Save a user to the test db and create new Feed
		//return Q.all([user.save(), feed.save()]).then(
		return Q.all([user.save()]).then(
			function () {
				feedItem = {
					title: 'Title',
					message: 'This is my message'
				};
			});
	});

	describe('for Logged In users', function () {
		var _test;

		beforeEach(function () {
			_test = this.currentTest;
			log.debug({ func: 'beforeEach', test: _test.title }, 'Setup');
			return stubs.agentLogin(agent, credentials);
		});

		it('should be able to load your own feed instance', function () {
				
			// Get the userId
			var userId = user.id;

			return agent.get('/api/feed')
				.expect(200)
				.then(function (feedsGetRes) {

				// Get Feeds list
				var feed = feedsGetRes.body;

				log.trace({ test: _test.title, feed: feed }, 'Got Feed from Body');
            
				// Set assertions
				(feed.user._id).should.equal(userId);

				feed.should.have.property('items');
				feed.should.have.property('activity');
			});
		});

		describe.skip('should create a new feed if no feed already exists', function () {
			beforeEach(function () {
				return Feed.remove().exec();
			});

			it('when loading your feed');
			it('when posting to your feed');
		});


		it('should be able to post a new item to the feed', function () {
			// Get the userId
			var userId = user.id;

			// Save a new Feed Item
			return agent.post('/api/feed')
				.send(feedItem)
				.expect(200)
				.then(
				function (feedItemSaveRes) {
					var itemResult = feedItemSaveRes.body;
					log.debug({ test: _test.title, body: feedItemSaveRes.body }, 'Setup');

					should.exist(itemResult);

					log.debug({ test: _test.title, feedItem: itemResult });

					itemResult.should.have.property('title');
					itemResult.should.have.property('message');
					itemResult.should.have.property('location');
					itemResult.should.have.property('user');
					itemResult.should.have.property('isPublic', false);
				
					// Get a list of Feeds
					return agent.get('/api/feed').expect(200);
				}).then(
				function (feedsGetRes) {
					// Get Feeds list
					var feedRes = feedsGetRes.body;

					log.debug({ test: _test.title, feed: feedRes });

					feedRes.should.have.property('activity').and.be.an.Array.with.length(1);

					// Set assertions
					feedRes.should.have.property('id', userId);
					feedRes.should.have.property('user');

					feedRes.user.should.equal(userId);
				});
		});

		it('should be able to get an existing feed item', function () {
			
			// Get the userId
			var userId = user.id;
			var savedItemResult;

			// Save a new Feed
			return agent.post('/api/feed')
				.send(feedItem)
				.expect(200)
				.then(
				function (feedItemSaveRes) {
					// Update Feed name
					feedItem = feedItemSaveRes.body;

					// Update existing Feed
					return agent.get('/api/feed/' + feedItemSaveRes.body._id)
						.expect(200);
				})
				.then(
				function (feedItemGetResponse) {
					// Set assertions
					(feedItemGetResponse.body._id).should.equal(feedItem._id);
				});
		});

		it('should be able to update an existing feed item', function () {
			
			// Get the userId
			var userId = user.id;
			var savedItemResult;

			// Save a new Feed
			return agent.post('/api/feed')
				.send(feedItem)
				.expect(200)
				.then(
				function (feedItemSaveRes) {
					// Update Feed name
					feedItem.title = 'WHY YOU GOTTA BE SO MEAN?';
					savedItemResult = feedItemSaveRes.body;

					// Update existing Feed
					return agent.put('/api/feed/' + feedItemSaveRes.body._id)
						.send(feedItem)
						.expect(200);
				})
				.then(
				function (feedUpdateRes) {
					// Set assertions
					(feedUpdateRes.body._id).should.equal(savedItemResult._id);
					(feedUpdateRes.body.title).should.match('WHY YOU GOTTA BE SO MEAN?');
				});
		});

		it('should not be able to save Feed Item if no title is provided', function () {
			// Invalidate name field
			feedItem.title = '';
			// Get the userId
			var userId = user.id;

			// Save a new Feed
			return agent.post('/api/feed')
				.send(feedItem)
				.expect(400)
				.then(function (feedSaveRes) {
				// Set message assertion
				(feedSaveRes.body.message).should.match('Please fill in Title');
			})
				.catch(function (feedSaveErr) {
				return Q.reject(feedSaveErr);
			});
		});

		it.skip('should be able to delete Feed Item instance', function (done) {
			var userId = user.id;

			// Save a new Feed
			return agent.post('/api/feed')
				.send(feedItem)
				.expect(200)
				.end(function (feedSaveErr, feedSaveRes) {
				// Handle Feed save error
				if (feedSaveErr) {return done(feedSaveErr);}

				// Delete existing Feed
				agent.delete('/api/feed/' + feedSaveRes.body._id)
					.expect(200)
					.end(function (feedDeleteErr, feedDeleteRes) {
					// Handle Feed error error
					if (feedDeleteErr) {return done(feedDeleteErr);}

					should.exist(feedDeleteRes.body);

					// Set assertions
					feedDeleteRes.body.should.have.property('_id', feedSaveRes.body._id);

					// Call the assertion callback
					done();
				});
			});
		});

	});

	describe('When NOT logged in', function () {
		var _test, feed;

		beforeEach(function () {
			_test = this.currentTest;
			// Create new Feed model instance
			var u = new User(stubs.getUser());
			feed = new Feed({ user: u });

			return Q.all([u.save(), feed.save()]);
		});

		it('should not be able to get a list of Feeds', function () {

			return agent.get('/api/feeds')
				.expect(404)
				.then(
				function (res) {
					log.trace({ test: _test.title, body: res.body, error: res.error });
					// Set assertion
					(_.isEmpty(res.body)).should.be.true;
					res.error.should.have.property('status', 404);
				},
				function (err) {
					log.error({ test: _test.title, error: err }, 'Errored');
					should.not.exist(err);
				});
		});

		it('should not be able to get _My Feed_', function () {
			return agent.get('/api/feed')
				.expect(404)
				.then(
				function (res) {
					log.trace({ test: _test.title, body: res.body, error: res.error });
					// Set assertion
					(_.isEmpty(res.body)).should.be.true;
					res.error.should.have.property('status', 404);
				},
				function (err) {
					log.error({ test: _test.title, error: err }, 'Errored');
					should.not.exist(err);
				});
		});

		it('should not be able to get an arbitrary Feed instance', function () {
			return agent.get('/api/feeds/' + feed._id)
				.expect(404)
				.then(
				function (res) {
					(_.isEmpty(res.body)).should.be.true;
					res.error.should.have.property('status', 404);
				},
				function (err) {
					should.not.exist(err);
				});
		});
	});

	describe('when an admin user', function () {
		var _test, feed;

		beforeEach(function () {
			_test = this.currentTest;
			// Create new feeds and users
			return stubs.populateStubUsers(10).then(function (users) {
				log.debug('Initialized %d users', users.length);

				return Q.all(_.map(users, function (user) {
					feed = new Feed({ user: user });

					return feed.save();
				}));
			})
				.then(function (results) {
				log.debug('Initialized %d users\' feeds', results.length);

				return stubs.populateAdminUser();
			})
				.then(function (adminUser) {
				// Re-Login to get 'admin' role
				credentials = stubs.getAdminCredentials();
				log.debug({ creds: credentials, adminUser: adminUser }, 'Logging in with credentials');
				return stubs.agentLogin(agent, credentials).then(function (s) {
					log.debug({func: 'admin:beforeEach', success: s},'logged into app with admin credentials');
				});
			});

		});

		it('should be able to get a list of Feeds if an admin', function () {
			return
			agent.get('/api/feeds')
				.expect(200)
				.then(
				function (res) {
					log.debug({ test: _test.title, body: res.body }, 'Got results from Feed Listing call');
					res.body.should.be.an.Array.with.lengthOf(1);
				});
		});
	});


	afterEach(function () {
		log.debug({ func: 'afterEach' }, 'Cleanup');
		return stubs.cleanTables([User, Feed, FeedItem])
			.then(function (res) {
			if (_.find(_.values(res), { ok: 0 })) {
				log.error({ func: 'afterEach', userRes: res[0], feedRes: res[1], feedItemRes: res[2] }, 'Results from cleanup');
			}
			return res;
		});
	});

	afterEach(function (done) {
		log.debug({ func: 'afterEach' }, 'Signing Out of API');
		agent.get('/api/auth/signout').expect(302).then(function(signoutRes) {
			log.debug({signoutRes: signoutRes}, 'signed out of app');
			done();
		});
	});


	after(function () {
		log.debug({ func: 'afterAll' }, 'FINAL Cleanup');
		return stubs.cleanTables([User, Feed, FeedItem])
			.then(function (res) {
			if (!!_.find(_.values(res), { ok: 1 })) {
				log.error({ func: 'afterAll', userRes: res[0], feedRes: res[1], feedItemRes: res[2] }, 'Results from final cleanup');
			}

			return res;
		});
	});

});


