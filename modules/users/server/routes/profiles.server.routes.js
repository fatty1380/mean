(function() {

    'use strict';

    module.exports = function(app) {
        // User Routes
        var users = require('../controllers/users.server.controller');

        app.route('/api/profiles')
            .get(users.requiresLogin, users.hasAuthorization(['admin']), users.list);

        app.route('/api/profiles/search')
            .get(users.requiresLogin, users.search);

        app.route('/api/profiles/:userId')
            .get(users.readProfile)
            .put(users.requiresLogin, users.hasAuthorization, users.update);
    };

})();
