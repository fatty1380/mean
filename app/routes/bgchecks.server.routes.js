'use strict';

module.exports = function(app) {
    var users = require('../../app/controllers/users');
    var bgchecks = require('../../app/controllers/bgchecks');

    // Bgchecks Routes
    app.route('/bgchecks')
        .get(bgchecks.list)
        .post(users.requiresLogin, bgchecks.create);

    app.route('/bgchecks/:bgcheckId')
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
    app.route('/bgcheck/login')
        .get(bgchecks.login);

    app.route('/bgcheck/logout')
        .get(bgchecks.logout);

    app.route('/bgcheck/applicants')
        .get(bgchecks.getAllApplicants);

    app.route('/bgcheck/applicants/:applicantId')
        .get(bgchecks.readApplicant);

    app.route('/bgcheck/applicants/:applicantId/report/:reportType')
        .get(bgchecks.runReport);

    app.route('/bgcheck/report/:reportId')
        .get(bgchecks.getReport);

    app.route('/bgcheck/report/:reportId/pdf')
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
