'use strict';

module.exports = function (app) {
    var acl = require('../policies/bgchecks.server.policy'),
        bgchecks = require('../controllers/bgchecks.server.controller'),
        path = require('path'),
        users = require(path.resolve('./modules/users/server/controllers/users.server.controller')),
        braintree = require(path.resolve('./modules/payments/server/controllers/braintree.server.controller'));


    // Report Type centric routes
    /**
     * GET:
     * Returns a list of report types based on what is saved locally.
     * This is the most common method for local hosting.
     *
     * POST:
     * This updates the Report definitions from the remote server.
     * this will likely be called occasionally.
     */
    app.route('/api/reports/types')
        .get(bgchecks.availableReportTypes, bgchecks.list.reports);

    app.route('/api/reports/:remoteSystem/update')
        .post(bgchecks.UpdateReportDefinitionsFromServer, bgchecks.SaveUpdatedReportDefinitions, bgchecks.list.reports);


    /**
     * This returns a Report Definition, including all necessary Field Definitions.
     * This will be used by the render-report page.
     */
    app.route('/api/reports/types/:sku')
        .get(acl.isAllowed, bgchecks.read.report);

    app.route('/api/reports/types/:sku/create')
        .post(acl.isAllowed, bgchecks.applicant.get, braintree.findCustomer, braintree.postApplicant, bgchecks.report.create);
        // Removed "braintree.findCustomer" since existing customer comes from the Nonce


    // Applicant Centered Routes

    /**
     *  * path: /api/users/:userId/driver/applicant
     * operations:
     *   -  httpMethod: GET
     *      summary: If it exists, will return an Applicant for the specified user
     *      notes: query parameters may be passed in URL
     *      responseClass: Applicant
     *      nickname: Get Applicant for User
     *
     * prerequisites:
     *      Request must be poplulated with a Driver object
     */
    app.route('/api/users/:userId/driver/applicant')
        .all(acl.isAllowed)
        .get(bgchecks.applicant.get, bgchecks.applicant.getRemote, bgchecks.applicant.read)
        .post(bgchecks.applicant.create, bgchecks.applicant.save);


    app.route('/api/override')
        .get(bgchecks.rerunReport);

    app.route('/api/reports/pdf')
        .get(bgchecks.report.loadPDF);

    /**
     *  * path: /api/reports/applicants
     * operations:
     *   -  httpMethod: GET
     *      summary: returns a list of applicants
     *      notes: query parameters may be passed in URL
     *      responseClass: [Applicant]
     *      nickname: Get All Applicants
     */
    app.route('/api/reports/applicants')
        .get(acl.isAllowed, bgchecks.applicant.list);

    app.route('/api/reports/applicants/:applicantId')
        .get(acl.isAllowed, bgchecks.applicant.get, bgchecks.applicant.read);


    /** REPORTS --------------------------------------- */
    app.route('/api/reports')
        .get(bgchecks.report.list);
    //    .get(bgchecks.applicant.get, bgchecks.report.applicantStatus) // Get status of all reports for applicant
    //    .post(bgchecks.applicant.get, bgchecks.report.create); // Create a new report

    app.route('/api/users/:userId/reports')
        .get(bgchecks.applicant.get, bgchecks.report.applicantStatus) // get status of all reports for applicant
        .post(bgchecks.applicant.get, bgchecks.report.create); // create a new report

    app.route('/api/reports/:reportId(/^[a-f\\d]{24}$/i)')
        .get(bgchecks.report.get) // Get the results of a report - maybe update if not complete?
        .post(bgchecks.report.status); // Update the report status (?)


    // Finish by binding the Bgcheck middleware
    app.param('sku', bgchecks.reportDefinitionBySKU);
    app.param('applicantId', bgchecks.applicantByID);
    app.param('reportId', bgchecks.reportByID);


    /** Report Update Routes **/

    app.route('/api/reports/update')
        .get(bgchecks.report.sync);
    app.route('/api/reports/pending'); // Get all Background Reports in a non-complete state;
    app.route('/api/reports/pdf');      // Get
};
