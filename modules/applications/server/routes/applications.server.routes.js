'use strict';

module.exports = function(app) {
    var users = require('../../../../modules/users/server/controllers/users.server.controller');
    var applications = require('../controllers/applications.server.controller');

    // Applications Routes
    app.route('/api/applications')
        .get(applications.listAll)
        .post(users.requiresLogin, applications.create);

    app.route('/api/applications/:applicationId')
        .get(applications.read)
        .put(users.requiresLogin, applications.hasAuthorization, applications.update)
        .delete(users.requiresLogin, applications.hasAuthorization, applications.delete);

    app.route('/api/applications/:applicationId/connect')
        .post(applications.createConnection);

    app.route('/api/jobs/:jobId/applications')
        .get(applications.queryByJobID) // ,
        .post(users.requiresLogin, applications.create);

    app.route('/api/jobs/:jobId/applications/:userId')
        .get(applications.getByJobId, applications.read);

    app.route('/api/companies/:companyId/applications')
        .get(applications.queryByCompanyID);

    app.route('/api/users/:userId/applications')
        .get(applications.queryByUserID);

    // Finish by binding the Application middleware
    app.param('applicationId', applications.applicationByID);
};
