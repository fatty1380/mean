'use strict';

module.exports = function (app) {
	// User Routes
	var users = require('../controllers/users.server.controller');
		
	// Friends & Connections
        
	app.route('/api/friends')
		.all(users.requiresLogin)
		.get(users.loadFriends);

	app.route('/api/friends/:userId')
		.all(users.requiresLogin)
		.get(users.checkFriendStatus)
		.delete(users.removeFriend);
            
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
		.get(users.listRequests)
		.post(users.createRequest);

	app.route('/api/requests/:requestId')
		.get(users.getRequest)
		.all(users.requiresLogin)
		.put(users.updateRequest);

	app.route('/api/users/:userId/friends')
		.get(users.requiresLogin, users.loadFriends);


	app.param('requestId', users.requestById);
};