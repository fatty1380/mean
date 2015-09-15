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

var _test;

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
		_test = this.currentTest;

		log.debug({ func: this.test.title, test: _test.title }, 'Setup');
		// Create user and credentials
        user = new User(stubs.user);
        credentials = stubs.getCredentials(user);

		// Save a user to the test db and create new Feed
		//return Q.all([user.save(), feed.save()]).then(
		return Q.all([user.save()]).then(
			function () {
				feedItem = {
					title: 'Title',
					message: 'This is my message',
					location: {
						coordinates: [37.4422623, -122.143102]
					}
				};
			});
	});

	describe('for Logged In users', function () {

		beforeEach(function () {
			_test = this.currentTest;
			log.debug({ func: this.test.title, test: _test.title }, 'Setup');
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
					(feed.id).should.equal(userId);

					feed.should.have.property('items');
					feed.should.have.property('activity');
				});
		});

		describe('should create a new feed if no feed already exists', function () {
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

						verifyFeedProperties(itemResult);
				
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

							return agent.get('/api/feed/' + feedRes.activity[0]);
						})
				.then(function success(feedItemResponse) {
					verifyFeedProperties(feedItemResponse.body);
				});
		});

		it('should be able to get an existing feed item', function () {
			
			// Get the userId
			var userId = user.id;
			var savedItemResult;

			// Save a new Feed Item
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

						verifyFeedProperties(feedItemGetResponse.body);
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


		it('should allow you to comment on your own activity feed item', function () {
			var message = { text: 'Wow! Thats really cool.' };
				
			// Save a new Feed
			return agent.post('/api/feed')
				.send(feedItem)
				.expect(200).then(function success(feedItemRes) {
					feedItem = feedItemRes.body;
					
					// Ensure that the "Friend" can comment on "Your" feed item
					return agent.post('/api/feed/' + feedItem.id + '/comments')
						.send(message)
						.expect(200);
				}).then(
					function (feedCommentRes) {
						// Set assertions
						feedCommentRes.body.should.be.Array.with.length(1);

						var comments = feedCommentRes.body;

						comments[0].should.have.property('text', message.text);
						comments[0].should.have.property('sender');

						return feedCommentRes;
					});

		});

		it('should not be able to `like` your own feed item', function () {
			
			// Get the userId
			var userId = user.id;
			var savedItemResult;

			var feedItemId;

			// Save a new Feed
			return agent.post('/api/feed')
				.send(feedItem)
				.expect(403)
				.then(
					function (feedItemSaveRes) {

						feedItemId = feedItemSaveRes.body.id;
						
						// Liek teh item
						return agent.post('/api/feed/' + feedItemId + '/likes')
							.expect(200);
					})
				.then(
					function (feedLikeRes) {
						// Set assertions
						feedLikeRes.body.should.be.Array.with.length(1);

						var likes = feedLikeRes.body;

						likes.should.containEql(userId);

						return agent.post('/api/feed/' + feedItemId + '/likes')
							.expect(200);
					})
				.then(
					function (feedLikeRes) {
						// Set assertions
						feedLikeRes.body.should.be.Array.with.length(1, 'Should not be able to like the same item twice');

						var likes = feedLikeRes.body;

						likes.should.containEql(userId);
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
					if (feedSaveErr) { return done(feedSaveErr); }

					// Delete existing Feed
					agent.delete('/api/feed/' + feedSaveRes.body._id)
						.expect(200)
						.end(function (feedDeleteErr, feedDeleteRes) {
							// Handle Feed error error
							if (feedDeleteErr) { return done(feedDeleteErr); }

							should.exist(feedDeleteRes.body);

							// Set assertions
							feedDeleteRes.body.should.have.property('_id', feedSaveRes.body._id);

							// Call the assertion callback
							done();
						});
				});
		});

		describe('When dealing with Company posts', function () {
			it('Should have basic data about the company populated');
			it('Should allow me to like it')
		});

		describe('When cross posting amongst friends', function () {
			var friend, notFriend;

			beforeEach(function () {
				log.debug({ test: _test.title, func: 'test.crossPost init' }, 'BeforeEach START');
				friend = new User(stubs.getUser());
				notFriend = new User(stubs.getUser());
				user.friends.push(friend._id);
				friend.friends.push(user._id);

				log.debug({ test: _test.title, func: 'test.crossPost init' }, 'Initialized before each stuff');
				return Q.all([friend.save(), user.save(), notFriend.save()])
					.then(function (results) {
						log.debug({ test: _test.title, func: 'test.crossPost init', user: results[1], friend: results[0] });

						results[0].should.have.property('friends').with.length(1);
						results[1].should.have.property('friends').with.length(1);

						return agent.post('/api/feed?sync=true').send(feedItem);
					})
					.then(function (feedSaveRes) {
						feedItem = feedSaveRes.body;

						return stubs.agentLogin(agent, stubs.getCredentials(friend));
					});
			});

			it('should post into a friend\'s activity feed (items)', function () {
				log.debug({ test: _test.title, feedItem: feedItem }, 'Posting Feed Item');

				return agent.get('/api/feed')
					.expect(200)
					.then(function (friendFeedResponse) {

						log.debug({ test: _test.title, response: friendFeedResponse }, 'Logged in');
						var feed = friendFeedResponse.body;

						feed.should.have.property('activity').and.have.length(0);
						feed.should.have.property('items').and.have.length(1);
					});
			});

			it('should allow you to like a friend\'s activity feed item', function () {
				
				// Ensure that the "Friend" can like "Your" feed item
				return agent.post('/api/feed/' + feedItem.id + '/likes')
					.expect(200).then(
						function (feedLikeRes) {
							// Set assertions
							feedLikeRes.body.should.be.Array.with.length(1);

							var likes = feedLikeRes.body;

							likes.should.containEql(friend.id);

							return feedLikeRes;
						});

			});

			it('should not allow you to like a non-friend\'s activity feed item', function () {
								
				// Ensure that the "Friend" can like "Your" feed item
				return stubs.agentLogin(agent, stubs.getCredentials(notFriend))
					.then(function () {
						return agent.post('/api/feed/' + feedItem.id + '/likes')
							.expect(403);
					});

			});



			it('should allow you to comment on a friend\'s activity feed item', function () {
				var message = { text: 'Wow! Thats really cool.' };
				
				// Ensure that the "Friend" can comment on "Your" feed item
				return agent.post('/api/feed/' + feedItem.id + '/comments')
					.send(message)
					.expect(200).then(
						function (feedCommentRes) {
							// Set assertions
							feedCommentRes.body.should.be.Array.with.length(1);

							var comments = feedCommentRes.body;

							comments[0].should.have.property('text', message.text);
							comments[0].should.have.property('sender');

							return agent.get('/api/feed/' + feedItem.id + '/comments');
						})
					.then(function (feedCommentsRes) {
						var comments = feedCommentsRes.body;

						comments.should.be.Array.with.length(1);
						comments[0].should.have.property('text', message.text);
						comments[0].should.have.property('sender');
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
						log.debug({ func: 'admin:beforeEach', success: s }, 'logged into app with admin credentials');
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
		agent.get('/api/auth/signout').expect(302).then(function (signoutRes) {
			log.trace({ signoutRes: signoutRes }, 'signed out of app');
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

function verifyFeedProperties(feedItem) {

	feedItem.should.have.property('created');
	feedItem.should.have.property('title');
	feedItem.should.have.property('message');
	feedItem.should.have.property('location');
	feedItem.should.have.property('user');
	feedItem.should.have.property('props');
	feedItem.should.have.property('isPublic', false);

	feedItem.should.have.property('user');
	feedItem.user.should.have.property('handle');
	feedItem.user.should.have.property('displayName');
	feedItem.user.should.have.property('profileImageURL');
	feedItem.user.should.have.property('id');

	feedItem.props.should.have.property('slMiles');
	feedItem.props.should.have.property('freight');

	feedItem.location.should.have.property('coordinates').and.have.length(2);
	feedItem.location.should.have.property('type', 'Point');
	feedItem.location.should.have.property('created');

}