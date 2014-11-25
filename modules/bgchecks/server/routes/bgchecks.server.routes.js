'use strict';

module.exports = function(app) {
    var users = require('../../../../modules/users/server/controllers/users.server.controller');
    var bgchecks = require('../controllers/bgchecks.server.controller');

    // Bgchecks Routes
    app.route('/api/bgchecks')
        .get(bgchecks.list)
        .post(users.requiresLogin, bgchecks.create);

    app.route('/api/bgchecks/:bgcheckId')
        .get(bgchecks.read)
        .put(users.requiresLogin, bgchecks.hasAuthorization, bgchecks.update)
        .delete(users.requiresLogin, bgchecks.hasAuthorization, bgchecks.delete);

    // DEBUGGING Routes
    /* Order of operations
     * ---------------------------------------------------
     * /bgcheck/login
     * /bgcheck/applicants
     * /bgcheck/applicants/:applicantId
     * /bgcheck/applicants/:applicantId/report/:reportType
     * /bgcheck/report/:reportId
     * /bgcheck/logout
     *
     * use 54 for applicantId
     *     "OFAC" for reportType
     *     120 for reportId
     */
    app.route('/api/bgcheck/login')
        .get(bgchecks.login);

    app.route('/api/bgcheck/logout')
        .get(bgchecks.logout);

    app.route('/api/bgcheck/applicants')
        .get(bgchecks.getAllApplicants);

    app.route('/api/bgcheck/applicants/:applicantId')
        .get(bgchecks.readApplicant);

    app.route('/api/bgcheck/applicants/:applicantId/report/:reportType')
        .get(bgchecks.runReport);

    app.route('/api/bgcheck/report/:reportId')
        .get(bgchecks.getReport);

    app.route('/api/bgcheck/report/:reportId/pdf')
        .get(bgchecks.getPdfReport);

    app.param('reportId', bgchecks.checkReportStatus);
    app.param('applicantId', bgchecks.getApplicant);


    //app.param('reportType', bgchecks.);
    //app.param('applicantId', bgchecks.);

    // Finish by binding the Bgcheck middleware
    app.param('bgcheckId', bgchecks.bgcheckByID);
    app.param('reportId', bgchecks.checkReportStatus);
    app.param('applicantId', bgchecks.getApplicant);
};
