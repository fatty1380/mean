'use strict';

module.exports = function (app) {
    var
        path = require('path'),
        users = require(path.resolve('./modules/users/server/controllers/users.server.controller')),
        applications = require(path.resolve('./modules/applications/server/controllers/applications.server.controller'));
    // Applications Routes
    app.route('/api/applications')
        .get(applications.executeQuery)
        .post(users.requiresLogin, applications.create);

    app.route('/api/applications/:applicationId')
        .all(users.requiresLogin, applications.hasAuthorization)
        .get(applications.read)
        .put(applications.update)
        .patch(applications.patch)
        .delete(applications.delete);

    app.route('/api/applications/:applicationId/connect')
        .post(applications.createConnection);

    app.route('/api/applications/:applicationId/messages')
        .get(applications.getMessages);

    app.route('/api/jobs/:jobId/applications')
        .get(applications.queryByJobID) // ,
        .post(users.requiresLogin, applications.create);

    app.route('/api/jobs/:jobId/applications/questions')
        .get(applications.getQuestions);

    app.route('/api/companies/:companyId/applications')
        .get(applications.queryByCompanyID);

    app.route('/api/users/:userId/applications')
        .get(applications.queryByUserID);

    // Finish by binding the Application middleware
    app.param('applicationId', applications.applicationByID);
};

var coreRoutes = {

    // LISTING (GET)
    // All Applicants - only available to admins
    // All applicants for a job
    // All applicants to a company

    // GET (GET)
    // Specific Applicant by ID
    // Specific Applicant By UserId

    // CREATE (POST)

    // UPDATE (PUT)
    // Specific Applicant by ID

    // SET (PATCH)
    // Application Status

};
