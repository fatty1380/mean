'use strict';

module.exports = function (app) {
    var
        path = require('path'),
        users = require(path.resolve('./modules/users/server/controllers/users.server.controller')),
        applications = require(path.resolve('./modules/applications/server/controllers/applications.server.controller')),
        releaseDocs = require(path.resolve('./modules/applications/server/controllers/release-documents.server.controller'));

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

    app.route('/api/applications/:applicationId/messages')
        .get(applications.getMessages);

    app.route('/api/jobs/:jobId/applications')
        .get(applications.queryByJobID) // ,
        .post(users.requiresLogin, applications.create);

    app.route('/api/jobs/:jobId/applications/:userId')
        .get(applications.getByJobId, applications.read)
        .post(users.requiresLogin, applications.hasAuthorization, applications.create)
        .put(users.requiresLogin, applications.hasAuthorization, applications.update);

    app.route('/api/jobs/:jobId/applications/questions')
        .get(applications.getQuestions);

    app.route('/api/companies/:companyId/applications')
        .get(applications.queryByCompanyID);

    app.route('/api/users/:userId/applications')
        .get(applications.queryByUserID);

    app.route('/api/releaseDocuments')
        .get(releaseDocs.runTest);
    app.route('/api/releaseHtml')
        .get(releaseDocs.runHTMLTest);

    // Finish by binding the Application middleware
    app.param('applicationId', applications.applicationByID);
};
