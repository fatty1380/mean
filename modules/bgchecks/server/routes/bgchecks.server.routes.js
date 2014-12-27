'use strict';

module.exports = function (app) {
    var users = require('../../../../modules/users/server/controllers/users.server.controller');
    var bgchecks = require('../controllers/bgchecks.server.controller');
    var everifile = require('../controllers/everifile.server.controller');
    //
    //// Bgchecks Routes
    //app.route('/api/bgchecks')
    //    .get(bgchecks.list)
    //    .post(users.requiresLogin, bgchecks.create);
    //
    //app.route('/api/bgchecks/:bgcheckId')
    //    .get(bgchecks.read)
    //    .put(users.requiresLogin, bgchecks.hasAuthorization, bgchecks.update)
    //    .delete(users.requiresLogin, bgchecks.hasAuthorization, bgchecks.delete);
    //
    //app.route('/api/users/:userId/bgchecks')
    //    .get(users.requiresLogin, bgchecks.hasAuthorization, bgchecks.listByUser);


    // Live eVerifile API Routes:

    app.route('/api/reports')
        .get(bgchecks.availableReportTypes, bgchecks.list.reports);
        //.post(everifile.hasSession, everifile.getUpdatedReportTypes, everifile.getReportFields, everifile.updateAvailableReports, bgchecks.list.reports);

    app.route('/api/reports/update')
        .post(bgchecks.UpdateReportDefinitionsFromServer, bgchecks.SaveUpdatedReportDefinitions, bgchecks.list.reports);

    app.route('/api/reports/:sku')
        .get(bgchecks.read.report);

    app.route('/api/reports/:sku/fields')
        .get(bgchecks.read.fields);

    //.get(everifile.updateReportDetails, bgchecks.getReportDetails);

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

    //app.route('/api/everifile/login')
    //    .get(everifile.login);

    app.route('/api/everifile/logout')
        .get(everifile.logout);

    //app.route('/api/everifile/applicants')
    //    .get(everifile.hasSession, everifile.getApplicants);

    app.route('/api/everifile/applicants/:applicantId')
        .get(everifile.getApplicant);

    app.route('/api/everifile/applicants/:applicantId/report/:reportType')
        .get(everifile.runReport);

    app.route('/api/everifile/report/:reportId')
        .get(everifile.getReport);

    app.route('/api/everifile/report/:reportId/pdf')
        .get(everifile.getPdfReport);

    app.param('reportId', everifile.checkReportStatus);
    app.param('applicantId', everifile.getApplicant);

    // Finish by binding the Bgcheck middleware
    app.param('bgcheckId', bgchecks.bgcheckByID);
    app.param('applicantId', everifile.getApplicant);
    app.param('sku', bgchecks.reportBySKU);
};
