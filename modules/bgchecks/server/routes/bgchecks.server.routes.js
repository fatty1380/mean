'use strict';

module.exports = function (app) {
    
    var acl = require('../policies/bgchecks.server.policy'),
        reports = require('../controllers/reports.server.controller'),
        remoteApplicant = require('../controllers/remote-applicant.server.controller'),
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
        .get(reports.types.list, reports.listReports);

    app.route('/api/reports/:remoteSystem/update')
        .post(reports.types.update, reports.types.save, reports.listReports);


    /**
     * This returns a Report Definition, including all necessary Field Definitions.
     * This will be used by the render-report page.
     */
    app.route('/api/reports/types/:sku')
        .get(acl.isAllowed, reports.readReport);

    app.route('/api/reports/types/:sku/create')
        .post(acl.isAllowed, remoteApplicant.get, braintree.findCustomer, braintree.postApplicant, reports.create);
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
        .get(remoteApplicant.get, remoteApplicant.getRemote, remoteApplicant.read)
        .post(remoteApplicant.create, remoteApplicant.save);


    app.route('/api/override')
        .get(reports.debug.run);

    app.route('/api/reports/pdf')
        .get(reports.loadPDF);

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
        .get(acl.isAllowed, remoteApplicant.list);

    app.route('/api/reports/applicants/:applicantId')
        .get(acl.isAllowed, remoteApplicant.get, remoteApplicant.read);


    /** REPORTS --------------------------------------- */
    app.route('/api/reports')
        .get(reports.list);
    //    .get(remoteApplicant.get, reports.applicantStatus) // Get status of all reports for applicant
    //    .post(remoteApplicant.get, reports.create); // Create a new report

    app.route('/api/users/:userId/reports')
        .get(remoteApplicant.get, reports.applicantStatus) // get status of all reports for applicant
        .post(remoteApplicant.get, reports.create); // create a new report

    app.route('/api/reports/:reportId(/^[a-f\\d]{24}$/i)')
        .get(reports.get) // Get the results of a report - maybe update if not complete?
        .post(reports.status); // Update the report status (?)


    // Finish by binding the Bgcheck middleware
    app.param('sku', reports.reportDefinitionBySKU);
    app.param('reportId', reports.reportByID);
    app.param('applicantId', remoteApplicant.applicantByID);


    /** Report Update Routes **/
    app.route('/api/reports/update')
        .get(reports.sync);
    app.route('/api/reports/pending'); // Get all Background Reports in a non-complete state;
    app.route('/api/reports/pdf');      // Get
};
