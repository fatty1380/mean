'use strict';

module.exports = function(app) {
    var users = require('../../../../modules/users/server/controllers/users.server.controller');
    var jobs = require('../controllers/jobs.server.controller');

    // Jobs Routes
    app.route('/api/jobs')
        .get(jobs.list)
        .post(users.requiresLogin, jobs.create);

    app.route('/api/jobs/:jobId')
        .get(jobs.read)
        .put(users.requiresLogin, jobs.hasAuthorization, jobs.update)
        .delete(users.requiresLogin, jobs.hasAuthorization, jobs.delete);

    app.route('/api/users/:userId/jobs')
        .get(jobs.queryByUserID);

    app.route('/api/companies/:companyId/jobs')
        .get(jobs.queryByCompanyID);

    // Finish by binding the Job middleware
    app.param('jobId', jobs.jobByID);
};
