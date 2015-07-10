'use strict';

module.exports = function(app) {
	var feeds = require('../controllers/feeds.server.controller');
	var feedsPolicy = require('../policies/feeds.server.policy');
	
	/**
	 * The "Feed" serves as the 'social inbox' for each user. As new posts are
	 * made, the post is the 'published' to each of their friends. While this
	 * slows things down on the front end, it greatly simplifies the rendering
	 * of each user's feed.
	 * 
	 * 		Assumption: Count(Feed.read()) >>> Count(Feed.write())
	 * 
	 * LISTING _________________________________________________________________
	 * The functionality for listing all feeds will be restricted to admin users
	 * and must take care to limit the projection of the select statement to 
	 * only get summary information: User's name, Feed Count, Oldest, Latest.
	 */
	 app.route('/api/feeds')
	    .all(feedsPolicy.isAllowed)
		.get(feeds.list);
		
	app.route('/api/feeds/:feedId')
		.all(feedsPolicy.feedIsAllowed)
		.get(feeds.read);
		
	/**
	 * READING & POSTING _______________________________________________________
	 * In order to abstract the inner workings of multiple feeds, the API path
	 * will simply be to reference to a monolithic feed, and the feed will be
	 * indexed and referenced by userId (the _id field is disabled).
	 * 
	 * When READING, the user's feed will be returned
	 * When POSTING, a `FeedItem` will be posted to the user's personal feed, 
	 * 	and then published to all of their friends.
	 */
	 app.route('/api/feed')
	 	.all(feeds.myFeed, feedsPolicy.feedIsAllowed)
		.get(feeds.read)
		.post(feeds.postItem);
	 
	 
	 /** 
	 * UPDATES _________________________________________________________________
	 * Reading a feed will be restricted to the user who's feed it is (+admin).
	 * The 
	 * 
	 */
	app.route('/api/feed/:feedItemId')
		.get(feeds.readItem)
		.all(feeds.myFeed, feedsPolicy.feedItemIsAllowed)
		.put(feeds.updateItem)
		.delete(feeds.deleteItem);
		
	/**
	 * COMMENTS _______________________________________________________________
	 * 
	 * TODO: Need to figure out how to properly check comment rights
	 */
	app.route('/api/feed/:feedItemId/comments')
		.all(feedsPolicy.isAllowed)
		.post(feeds.addComment);

	// Finish by binding the Feed middleware
	app.param('feedId', feeds.feedByID);
	app.param('feedItemId', feeds.feedItemByID);
};                                 