'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	path = require('path'),
	Q = require('q'),
    log = require(path.resolve('./config/lib/logger')).child({
        module: 'feed',
        file: 'server.controller'
    }),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

var mongoose = require('mongoose'),
	Feed = mongoose.model('Feed'),
	FeedItem = mongoose.model('FeedItem'),
	GeoJson = mongoose.model('GeoJson');

exports.postItem = postItem;
exports.updateItem = updateItem;
exports.deleteItem = deleteItem;
exports.listItems = listItems;
exports.readItem = readItem;
exports.addComment = addComment;
exports.read = read;
exports.list = list;
exports.feedByID = feedByID;
exports.myFeed = myFeed;
exports.feedItemByID = feedItemByID;

exports.addLike = addLike;
exports.getLikes = getLikes;
exports.removeLike = delLike;

(function migrate() {
				log.error({ func: 'migrate' }, 'Evaluating Migration');

	FeedItem.collection.update({ location: { $exists: true } },
		{ $rename: { 'location': '_location' } },
		{ multi: true },
		function (err, rawResponse) {
			if (!!err) {
				log.error({ func: 'migrate', rawResponse: rawResponse, error: err }, 'Migration failed with error');
			}

			if (!!rawResponse && rawResponse.nModified > 0) {
				log.always({ func: 'migrate', rawResponse: rawResponse }, 'Completed Migration of Old Feed Items to new');
			}
		});
})();

/**
 * Create a Feed Item
 */
function postItem(req, res) {
	var item = new FeedItem(req.body);
	item.user = req.user;

	item.location = !_.isEmpty(req.body.location) ? new GeoJson(req.body.location) : null;

	req.log.info({ item: item, func: 'postItem' }, 'Saving Item');


	var feed = req.feed;
	feed.activity.push(item);
	feed.items.push(item);

	req.log.info({ feed: feed, func: 'postItem', sync: req.query.sync }, '... to Feed');

	item.save()
		.then(
			function (item) {
				return feed.save();
			})
		.then(
			function (feed) {
				req.log.info({ result: feed, item: item, func: 'postItem' }, 'Feed Saved with Result');

				if (!req.query.sync) {
					req.log.debug({ result: feed, item: item, func: 'postItem' }, 'Async Cross Post - returning');
					res.json(item);
				}

				return crossPost(req.user, item);
			})
		.then(function (crossPostResult) {
			req.log.debug({ crossPost: crossPostResult, item: item, func: 'postItem' }, 'Finished Cross Post');

			if (!!req.query.sync) {
				req.log.debug({ item: item, func: 'postItem' }, 'Sync Cross Post - returning');
				return res.json(item);
			}
		})
		.then(null,
			function (err) {
				req.log.error({ error: err, item: item }, 'failed to save item');
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			});
}

/**
 * Update a Feed Item
 */
function updateItem(req, res) {
	var feedItem = req.feedItem;

	feedItem = _.extend(feedItem, req.body);

	feedItem.save().then(function (feedItem) {
		req.feedItem = feedItem;
		res.json(feedItem);
	}, function (err) {
		req.log.error({ error: err, item: feedItem }, 'failed to save item');

		return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		});
	});
}

/**
 * Delete a Feed Item
 */
function deleteItem(req, res) {
	var feed = req.feed;

	feed.remove(function (err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(feed);
		}
	});
}

/**
 * List of Feed Items
 */
function listItems(req, res) {
	FeedItem.find().sort('-created')
		.populate('user', 'displayName')
		.exec(function (err, feeds) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.json(feeds);
			}
		});
}

/**
 * Single Feed Item
 */
function readItem(req, res) {
	res.json(req.feedItem);
}

// *** END ITEMS *** //

// *** START Comments *** //

function addComment(req, res, next) {
	return next(new Error('not implemented exception'));
}

// *** END Comments *** //

/** Likes : Start */

function addLike(req, res) {
	if (_.isEmpty(req.feedItem)) {
		return res.status(404).send({ message: 'no feed activity specified' });
	}

	var _id = req.user._id;

	req.log.debug({ func: 'addLike', file: 'feeds.server.controller', likes: req.feedItem.likes, id: req.user.id }, 'Pushing ID to Likes Array');


	if (req.feedItem.likes.some(function (like) {
		return like.equals(req.user.id);
	})) {
		req.log.debug({ func: 'addLike', file: 'feeds.server.controller', likes: req.feedItem.likes, id: req.user.id }, 'User has already liked this item');

		return res.json(req.feedItem.likes);
	}
	req.feedItem.likes.push(_id);

	req.feedItem.save()
		.then(function success(result) {
			req.log.error({ result: result, likes: result.likes, func: 'addLike', file: 'feeds.server.controller' }, 'Added like to likes array');

			return res.json(result.likes);

		}, function reject(err) {
			req.log.error({ err: err, func: 'addLike', file: 'feeds.server.controller' }, 'Failed to add Like');

			return res.status(400).send({ message: 'Unable to like this item' });
		})
}

function getLikes(req, res) {
	if (_.isEmpty(req.feedItem)) {
		return res.status(404).send({ message: 'no feed activity specified' });
	}

	return res.json(req.feedItem.likes);
}

function delLike(req, res) {
	if (_.isEmpty(req.feedItem)) {
		return res.status(404).send({ message: 'no feed activity specified' });
	}

	_.remove(req.feedItem.likes, function (like) {

		req.log.debug({ func: 'deleteLike', file: 'feeds.server.controller', like: like, id: req.user.id }, 'Looking to remove Likes');

		if (like.equals(req.user.id) || like.id.equals(req.user.id)) {
			return true;
		}

		return false;
	});

}

/**
 * Show the current Feed
 */
function read(req, res) {
	res.json(req.feed);
}

/**
 * List of Feeds
 */
function list(req, res) {
	Feed.find().sort('-created')
		.populate('user', 'displayName')
		.exec(function (err, feeds) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				req.log.debug({ func: 'list', feeds: feeds }, 'Returning %d feeds', feeds.length);
				res.json(feeds);
			}
		});
}

/**
 * Feed middleware
 */
function feedByID(req, res, next, id) {
	req.log.debug({ func: 'feedByid', id: id }, 'Looking up Feed by ID');

	Feed.findById(id)
		.populate('items')
		.exec(function (err, feed) {
			if (err) { return next(err); }
			if (!feed) { return next(new Error('Failed to load Feed ' + id)); }
			req.feed = feed;
			next();
		});
}

function feedItemByID(req, res, next, id) {
	req.log.debug({ func: 'feedItemByID', id: id }, 'Looking up Feed Item by ID');

	FeedItem.findById(id)
		.populate({ path: 'user', select: 'handle displayName', model: 'User' })
		.populate({ path: 'company', select: 'name profileImageURL', model: 'Company' })
		.exec().then(
			function (feedItem) {
				req.log.debug({ feedItem: feedItem, method: 'feedItemById.FeedItem.findById' }, 'Feed Item result');

				if (!feedItem) {
					return next(new Error('Failed to load feed Item ' + id));
				}

				req.feedItem = feedItem;
				next();
			},
			function (err) {
				req.log.error({ error: err }, 'Error retrieving feed item %s', id);
				return next(err);
			});
}

function myFeed(req, res, next) {
	if (!req.user || !req.user._id) {
		req.log.debug('No logged in user - No feed');
		return next();
	}

	log.debug({ func: 'myFeed', user: req.user.id }, 'Finding Feed for user ...');

	return getOrCreateFeed(req.user._id, req.log)
		.then(function (feed) {
			log.debug({ func: 'myFeed' }, 'Returning Feed id:%s', feed.id);
			req.feed = feed;
			next();
		}, function (err) {
			req.log.error({ func: 'myFeed', error: err });
			return next(err);
		});
}

function getOrCreateFeed(userId, log) {
	return Feed.findById(userId)
	//	.populate({ path: 'items', model: 'FeedItem', options: { sort: { 'created': -1 } } })
	//		.populate({ path: 'items', select: 'created user', model: 'FeedItem', options: { sort: { 'created': -1 } } })
	//.populate({path: 'items.user', select: 'handle displayName', model: 'User'})
		.exec()
		.then(function (feed) {
			log.debug({ func: 'getOrCreateFeed', feed: feed });
			if (!feed) {
				log.debug({ func: 'getOrCreateFeed' }, '... hmmm, Creating new feed for user');
				feed = new Feed({ user: userId });

				return feed.save();
			} else {
				log.debug({ func: 'getOrCreateFeed', feed: feed }, '... Found it!');
				return feed;
			}
		})
}

/** Private Method implementations ____________________________________________________________________ */

/**
 * Fan out on write 'cross-post' implementation method
 */
function crossPost(user, item) {
	log.debug({ func: 'crossPost', friends: _.uniq(user.friends) }, 'initializing cross post');
	return Q.all(_.map(user.friends, postItemToFriend, this));
}

function postItemToFriend(friend) {
	var item = this.item;

	log.debug({ func: 'crossPost', friend: friend, isString: _.isString(friend) }, 'looking up friend for post');

	return getOrCreateFeed(friend, log).then(
		function (theirFeed) {
			log.debug({ func: 'crossPost', feed: theirFeed }, 'posting feed item by %s to friend %s', user.id, theirFeed.user.id);
			theirFeed.items.push(item);

			return theirFeed.save();
		}).then(
			function (success) {
				log.debug({ func: 'crossPost', resultFeed: success }, 'posted feed item to friend');

				return success;
			});
}