(function() {
    'use strict';

    module.exports = function(app) {
        // User Routes
        var users = require('../controllers/users.server.controller');

        // Setting up the users profile api
        app.route('/api/users/me').get(users.me);
        app.route('/api/users').put(users.update);
        app.route('/api/users/accounts').delete(users.removeOAuthProvider);
        app.route('/api/users/password').post(users.changePassword);
        app.route('/api/users/picture').post(users.changeProfilePicture);

        // Friends & Connections
        
        app.route('/api/friends')
            .all(users.requiresLogin)
            .get(users.loadFriends);
            
        app.route('/api/friends/status/:userId')
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
        app.route('/api/friends/requests')
            .all(users.requiresLogin)
            .get(users.listRequests)
            .post(users.createRequest);
            
        app.route('/api/friends/requests/:requestId')
            .all(users.requiresLogin)
            .get(users.getRequest)
            .put(users.updateRequest);
            
        app.route('/api/users/:userId/friends')
            .get(users.requiresLogin, users.loadFriends);

        // Seed User Creation
        app.route('/api/seed')
        .post(users.createSeed);

        // Finish by binding the user middleware
        app.param('userId', users.userByID);
        app.param('requestId', users.requestById);
    };
})();
