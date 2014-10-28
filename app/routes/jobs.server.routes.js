'use strict';

module.exports = function(app) {
    var users = require('../../app/controllers/users');
    var jobs = require('../../app/controllers/jobs');

    // Jobs Routes
    app.route('/jobs')
        .get(jobs.list)
        .post(users.requiresLogin, jobs.create);

    app.route('/jobs/:jobId')
        .get(jobs.read)
        .put(users.requiresLogin, jobs.hasAuthorization, jobs.update)
        .delete(users.requiresLogin, jobs.hasAuthorization, jobs.delete);

    app.route('/users/:userId/jobs')
        .get(jobs.readList);

    app.route('/companies/:companyId/jobs')
        .get(jobs.readList);

    // Finish by binding the Job middleware
    app.param('jobId', jobs.jobByID);
    app.param('userId', jobs.queryByUserID);
    app.param('companyId', jobs.queryByCompanyID);
};
