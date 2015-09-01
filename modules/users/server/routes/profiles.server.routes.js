(function() {

    'use strict';

    /**
     * These routes are covered by tests in `user.search.server.routes.tests.js`
     */
    module.exports = function(app) {
        // User Routes
        var users = require('../controllers/users.server.controller');

        /**
         * @api {get} /users Request a list of users
         * @apiName ListAllUsers
         * @apiGroup Users
         * 
         * 
         */
        app.route('/api/profiles')
            .get(users.requiresLogin, users.list);
//            .get(users.requiresLogin, users.hasAuthorization(['admin']), users.list);

        /**
         * @api {get} /users Request a list of users
         * @apiName GetAllUsers
         * @apiGroup Users
         */
        app.route('/api/profiles/search')
            .get(users.requiresLogin, users.search);

        /**
         * @api {get} /users Request a list of users
         * @apiName GetAllUsers
         * @apiGroup Users
         */
        app.route('/api/profiles/:userId')
            .get(users.readProfile)
            .put(users.requiresLogin, users.hasAuthorization, users.update);
    };

})();
