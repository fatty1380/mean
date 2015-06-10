'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	path = require('path'),
	mongoose = require('mongoose'),
	Feed = mongoose.model('Feed'),
	FeedItem = mongoose.model('FeedItem'),
    log = require(path.resolve('./config/lib/logger')).child({
        module: 'feed',
        file: 'server.controller'
    }),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));


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

/**
 * Create a Feed Item
 */
function postItem(req, res) {
	var item = new FeedItem(req.body);
	item.user = req.user;
	
	req.log.info({item: item, func: 'postItem'}, 'Saving Item')
	
	var feed = req.feed;
	feed.activity.push(item);
	feed.items.push(item);
	
	req.log.info({feed: feed, func: 'postItem'}, '... to Feed');

	item.save().then(function(item) {
		
	return feed.save();
	}).then(function(feed) {
		req.log.info({result: feed, item: item, func: 'postItem'}, 'Feed Saved with Result');
		res.json(item);
		
		crossPost(req.user, item);
	}).then(null,
	function(err) {
			req.log.error({error: err, item: item}, 'failed to save item');
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
	});
};

/**
 * Update a Feed Item
 */
function updateItem(req, res) {
	var feedItem = req.feedItem ;

	feedItem = _.extend(feedItem , req.body);

	feedItem.save().then(function(feedItem) {
			req.feedItem = feedItem;
			res.jsonp(feedItem);
	}, function(err) {
			req.log.error({error: err, item: item}, 'failed to save item');
			
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
	});
};

/**
 * Delete a Feed Item
 */
function deleteItem(req, res) {
	var feed = req.feed ;

	feed.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(feed);
		}
	});
};

/**
 * List of Feed Items
 */
function listItems(req, res) { 
	FeedItem.find().sort('-created')
	.populate('user', 'displayName')
	.exec(function(err, feeds) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(feeds);
		}
	});
};

/**
 * Single Feed Item
 */
 function readItem(req, res) {
	 res.json(req.feedItem);
 }

// *** END ITEMS *** //

// *** START Comments *** //

function addComment(req, res) {
	return next(new Error('not implemented exception'));
}

// *** END Comments *** //

/**
 * Show the current Feed
 */
function read(req, res) {
	res.json(req.feed);
};

/**
 * List of Feeds
 */
function list(req, res) { 
	Feed.find().sort('-created').populate('user', 'displayName')
	.exec(function(err, feeds) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			req.log.debug({func: 'list', feeds: feeds}, 'Returning %d feeds', feeds.length);
			res.json(feeds);
		}
	});
};

/**
 * Feed middleware
 */
function feedByID(req, res, next, id) { 
	req.log.debug({func: 'feedByid', id: id}, 'Looking up Feed by ID');

	Feed.findById(id).populate('user', 'displayName').exec(function(err, feed) {
		if (err) return next(err);
		if (! feed) return next(new Error('Failed to load Feed ' + id));
		req.feed = feed ;
		next();
	});
};

function feedItemByID(req, res, next, id) { 
	req.log.debug({func: 'feedItemByID', id: id}, 'Looking up Feed Item by ID');
	
	FeedItem.findById(id).exec().then(
		function(feedItem) {
			req.log.debug({feedItem: feedItem, method: 'feedItemById.FeedItem.findById'}, 'Feed Item result');
			
			if (! feedItem) {
				return next(new Error('Failed to load feed Item ' + id));
			}
			
			req.feedItem = feedItem;
			next();
	},
	function(err) {
		req.log.error({error: err}, 'Error retrieving feed item %s', id);
		return next(err);
	});
};

function myFeed(req, res, next) { 
	if(!req.user || !req.user._id) {
		req.log.debug('No logged in user - No feed');
		return next();
	}
	
	log.debug({func: 'myFeed', user: req.user.id}, 'Finding Feed for user ...');
	
	return Feed.findById(req.user._id)
	.exec()
	.then(function(feed) {
		req.log.debug({func: 'myFeed', feed: feed});
		if (!feed) { 
			req.log.debug({func: 'myFeed'}, '... hmmm, Creating new feed for user');
			feed = new Feed({user: req.user});
			
			return feed.save();
		} else {
			log.debug({func: 'myFeed', feed: feed}, '... Found it!');	
			return feed;
		}
	})
	.then(function(feed) {
		log.debug({func: 'myFeed'}, 'Returning Feed %s', feed.id);
		req.feed = feed;
		next();
	}, function(err) {
		req.log.error({func: 'myFeed', error: err});
		return next(err);
	});
};

/** Private Method implementations ____________________________________________________________________ */

/**
 * Fan out on write 'cross-post' implementation method
 */
function crossPost(user, item) {
	_.map(user.friends, function(friend) {
		Feed.findById(user.id).then(
			function(userFeed) {
				userFeed.items.push(item);
				
				return userFeed.save();
		}).then(
			function(success) {
				log.debug({func: 'crossPost', resultFeed: success}, 'posted feed item to friend');
				
				
			}
		);
	});
}