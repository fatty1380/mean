(function() {
    'use strict';
    
    var passport = require('passport');
    
    /**
     * Users Routes
     * @module users
     */

    module.exports = function (app) {
        // User Routes
        var users = require('../controllers/users.server.controller');

        /**
         * @api {get} /users/me Request the logged in user's User
         * @apiName GetMyUser
         * @apiGroup Users
         */
        app.route('/api/users/me')
            .get(users.me);
        /**
         * @api {put} /users Update the logged in user
         * @apiName GetAllUsers
         * @apiGroup Users
         */
        app.route('/api/users').put(users.update);
        app.route('/api/users/accounts').delete(users.removeOAuthProvider);
        app.route('/api/users/password').post(users.changePassword);
        app.route('/api/users/picture').post(users.changeProfilePicture);

        
        // Seed User Creation
        app.route('/api/seed')
        .post(users.createSeed);

        // Finish by binding the user middleware
        app.param('userId', users.userByID);
        app.param('requestId', users.requestById);
    };
})();
