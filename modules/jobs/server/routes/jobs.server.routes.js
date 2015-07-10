'use strict';

module.exports = function(app) {
    var users = require('../../../../modules/users/server/controllers/users.server.controller');
    var jobs = require('../controllers/jobs.server.controller');

    // Jobs Routes
    app.route('/api/jobs')
        .get(jobs.executeQuery, jobs.list)
        .post(users.requiresLogin, jobs.validateSubscription, jobs.create);

    app.route('/api/jobs/:jobId')
        .get(jobs.read)
        .put(users.requiresLogin, jobs.hasAuthorization, jobs.update)
        .delete(users.requiresLogin, jobs.hasAuthorization, jobs.delete);

    app.route('/api/users/:userId/jobs')
        .get(jobs.queryByUserID, jobs.executeQuery, jobs.list);

    app.route('/api/companies/:companyId/jobs/applications')
        .get(jobs.queryByCompanyID, jobs.populateApplications, jobs.executeQuery, jobs.list);

    // Finish by binding the Job middleware
    app.param('jobId', jobs.jobByID);
};
