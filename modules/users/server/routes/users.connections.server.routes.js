'use strict';

module.exports = function (app) {
	// User Routes
	var path = require('path'),
		users = require('../controllers/users.server.controller'),
		Requests = require('../controllers/requests.server.controller'),
		requestsPolicy = require(path.resolve('./modules/users/server/policies/requests.server.policy'));
		
            
	/** 
	 * Listing of the Requests
	 * =======================
	 * Query Params:
	 *      status : ['new', 'accepted', rejected']
	 *      sender : id
	 *      recipient : id
	 */
	app.route('/api/requests')
		.all(users.requiresLogin)
		.get(Requests.listRequests)
		.post(Requests.createRequest);

	app.route('/api/requests/:requestId')
		.get(Requests.getRequest)
		.all(users.requiresLogin)
		.put(users.updateFriendRequest, Requests.updateRequest, Requests.closeRequestChain);

	app.route('/r/:shortId')
		.all(requestsPolicy.isAllowed)
		.get(Requests.loadRequest);
	
	app.param('requestId', Requests.requestById);
		
	////////////////////////////////////////////////////////////////////////////
		
	// Friends & Connections
        
	app.route('/api/friends')
		.all(users.requiresLogin)
		.get(users.loadFriends);

	app.route('/api/friends/:userId')
		.all(users.requiresLogin)
		.get(users.checkFriendStatus)
        .delete(users.removeFriend);
        
	app.route('/api/friends/:userId')
		.put(users.updateFriendRequest);

	app.route('/api/users/:userId/friends')
		.get(users.requiresLogin, users.loadFriends);
};