'use strict';

module.exports = function(app) {
    var users = require('../../app/controllers/users');
    var applications = require('../../app/controllers/applications');

    app.route('/profile/applications')
        .get(applications.loadMine);

    // Applications Routes
    app.route('/applications')
        .get(applications.list)
        .post(users.requiresLogin, applications.create);

    app.route('/users/me/applications')
        .get(users.requiresLogin, applications.loadMine);

    app.route('/applications/:applicationId')
        .get(applications.read)
        .put(users.requiresLogin, applications.hasAuthorization, applications.update)
        .delete(users.requiresLogin, applications.hasAuthorization, applications.delete);

    app.route('/jobs/:jobId/applications')
        .get(applications.queryByJobID);

    app.route('/users/:userId/applications')
        .get(applications.queryByUserID);

    // Finish by binding the Application middleware
    app.param('applicationId', applications.applicationByID);
};
