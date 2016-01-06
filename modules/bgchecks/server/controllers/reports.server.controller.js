'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    path = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    Bgcheck = mongoose.model('BackgroundReport'),
    ReportType = mongoose.model('ReportType'),
    ReportApplicant = mongoose.model('ReportApplicant'),
    q = require('q'),
    everifileConfig = require(path.resolve('./config/systems/everifile')),
    everifile = require(path.resolve('./modules/bgchecks/server/controllers/everifile.server.service')),
    constants = require(path.resolve('./modules/core/server/models/outset.constants')),
    fileUploader = require(path.resolve('./modules/core/server/controllers/s3FileUpload.server.controller')),
    _ = require('lodash'),
    log = require(path.resolve('./config/lib/logger')).child({
        module: 'bgchecks',
        file: 'reports.server.controller'
    });

exports.types = {
    list: availableReportTypes,
    update: UpdateReportDefinitionsFromServer,
    save: SaveUpdatedReportDefinitions
};

exports.availableReportTypes = availableReportTypes;
exports.UpdateReportDefinitionsFromServer = UpdateReportDefinitionsFromServer;
exports.SaveUpdatedReportDefinitions = SaveUpdatedReportDefinitions;

_.extend(exports, {
    list: ListAllReports,
    create: CreateNewReport,
    applicantStatus: CheckApplicantReportStatus,
    status: CheckRemoteReportStatus,
    get: GetReportData,
    loadPDF: LoadPDFData, // this should only be used internally?
    sync: doReportSync
});

/** Bound Router Middleware ------------------------------------------ **/
exports.reportDefinitionBySKU = reportBySKU;
exports.reportByID = reportByID;

_.extend(exports, {
    listReports: listReports,
    listFields: listFields,
    readReport: readReport,
    readFields: readFields
});

exports.debug = {
    run: rerunReport
};


/** BEGIN : Implementation -------------------------------------------- **/

function availableReportTypes(req, res, next) {
    req.log.debug({ func: 'availableReportTypes', file: 'reports.server.controller' }, 'request query: %j', req.query);
    var query;
    if (req.query.returnAll) {
        query = {};
        req.log.debug({ func: 'availableReportTypes', file: 'reports.server.controller' }, 'loading all report types');
    }
    else {
        query = { 'enabled': true };
        req.log.debug({ func: 'availableReportTypes', file: 'reports.server.controller' }, 'loading all enabled report types');
    }

    ReportType.find(query)
    //.populate('fields')
        .exec(function (err, reportTypes) {
            if (err) {
                return res.status(400).send({
                    message: err.message,
                    error: err
                });
            }

            req.log.debug({ func: 'availableReportTypes', file: 'reports.server.controller' }, 'loaded %d reports', reportTypes && reportTypes.length || -1);

            res.json(reportTypes);
        });
}

/** Router Middleware ------------------------------------------ **/

function reportBySKU(req, res, next, id) {
    req.log.debug({ func: 'reportBySKU', file: 'reports.server.controller' }, 'Looking up report for SKU: %s', id);
    req.log.debug({ func: 'reportBySKU', file: 'reports.server.controller', sourceReports: everifileConfig.reportPackages }, 'Searching avilable hard-coded report packages');

    var sku = _.isArray(id) ? _.first(id) : id;
    
    //var rpt = _.find(constants.reportPackages, { 'sku': id });
    var rpt = _.find(everifileConfig.reportPackages, { 'sku': sku });

    if (rpt) {
        req.log.debug({ func: 'reportBySKU', file: 'reports.server.controller' }, 'Found hardcoded report type for SKU %s ... Returning', sku);

        req.reportType = rpt;
        return next();
    }

    ReportType.findOne({ 'sku': sku })
        .exec()
        .then(
            function (reportType) {
                if (!!reportType) {
                    req.log.debug({ func: 'reportBySKU', file: 'reports.server.controller' }, 'got report for sku [%s]: %o', sku, reportType);
                }
                else {
                    req.log.warn({ func: 'reportBySKU', file: 'reports.server.controller' }, 'No report for sku [%s]', sku);
                }
                req.reportType = reportType;
                next();
            })
        .catch(
            function (err) {
                req.log.error({ func: 'reportBySKU', file: 'reports.server.controller', err: err }, 'ReportBySKU] ERROR: ', err);
                return next(err);
            });

}

/**
 * Helper Functions
 */

function listReports(req, res) {
    return listHandler(req, res, 'report types', req.reportTypes);
}
function listFields(req, res) {
    return listHandler(req, res, 'report fields', req.fieldDefs);
}
function readReport(req, res) {
    return readHandler(req, res, 'report types', req.reportType);
}
function readFields(req, res) {
    return readHandler(req, res, 'report fields', req.reportType.fields);
}

function listHandler(req, res, name, vals) {
    debugger;
    if (vals === null) {
        if (!!req.failures && req.failures.length > 0) {
            return res.status(502).send({
                message: 'Upstream failure in processing requests',
                results: req.failures
            });
        } else {
            return res.status(404).send({
                message: 'No ' + name + ' present in request - sadface!'
            });
        }
    }

    if (!!req.failures && req.failures.length > 0) {
        return res.json({ reports: vals, failures: req.failures });
    }

    return res.json(vals);
}

function readHandler(req, res, name, value) {
    if (!value) {
        return res.status(404).send({
            message: 'No ' + name + ' found'
        });
    }

    res.json(value);
}


/** ----------------------------------------------------- **/
/** This is the good stuff!                               **/
/** ----------------------------------------------------- **/
function UpdateReportDefinitionsFromServer(req, res, next) {

    return everifile.GetSession().then(
        function (session) {
            everifile.GetReportTypeDefinitions(session, true, true).then(
                function (results) {
                    req.reportTypes = handleSettledPromises(results, req, 'reportTypes', 'failures');
                    next();
                }
                );
        }, function (err) {
            log.error({ func: 'UpdateReportDefinitionsFromServer', err: err }, 'UpdateReportDefinitionsFromServer failed');
            next(error);
        });
}


function SaveUpdatedReportDefinitions(req, res, next) {

    if (!req.reportTypes) {
        log.debug({ func: 'SaveUpdatedReportDefinitions' }, 'No Report types present in request!');
        return next();
    }

    console.log('Got data for %d report types', req.reportTypes);

    var reportsToBeProcessed = req.reportTypes.map(generateQueries);

    log.debug({ func: 'SaveUpdatedReportDefinitions' }, 'Analyzing %d of $d report types', reportsToBeProcessed.length, req.reportTypes.length);

    q.allSettled(reportsToBeProcessed).then(
        function (processedReportTypes) {
            console.log('Ready to upsert %d report types', processedReportTypes.length);

            return q.allSettled(processedReportTypes.map(function (preAndUpdateVals) {
                return q.resolve(preAndUpdateVals.value).spread(reportTypeUpsert);
            }));
        },
        function (error) {
            console.error('Error reported in processing reports', error);
            q.reject(error);
        })
        .done(function (results) {
            req.reportTypes = handleSettledPromises(results, req, 'reportTypes', 'failures');

            next();
        }, function (error) {
            console.log('error: %j', error);
            res.status(503).send({
                message: error.message,
                error: error
            });
        });


}

// private ,,,

function handleSettledPromises(results, request, success, failure) {

    var tmpSuccesses = [];
    var failures = request[failure] || [];

    results.map(function (promise) {
        if (promise.state === 'fulfilled') {
            tmpSuccesses.push(promise.value);
        } else if (promise.state === 'rejected') {
            failures.push(promise.reason);
        }
    });

    request[failure] = failures;
    request[success] = tmpSuccesses;

    return tmpSuccesses;
}

/**
 * Based on a raw report data from the remote server, returns a two-part promise containing a mongoose query
 * and the reportType repsonse from the remote server
 * @param reportTypeData The Report Type Response from the remote server.
 * @returns {!Promise.<!Array>}
 */
function generateQueries(reportTypeData) {
    log.debug({ func: 'generateQueries' }, 'Querying DB for existing "%s:%s" report', reportTypeData.sku, reportTypeData.name);

    var reportQueryPromise = ReportType
        .findOne({ 'sku': reportTypeData.sku })
    //.populate('fields')
        .exec();

    // Resolve as array to facilitate spreading to reportTypeUpsert
    return q.all([reportQueryPromise, q.resolve(reportTypeData)]);
}

function reportTypeUpsert(dbValue, newReport) {

    var report;

    log.debug({ func: 'reportTypeUpsert' }, 'Upserting report type with data %j', newReport);

    if (!dbValue) {
        report = new ReportType(newReport);
        log.debug({ func: 'UpdateAvailableReports' }, 'Creating a new report type with data %j', newReport);
    } else {
        report = _.extend(dbValue, newReport);

        if (!dbValue.isModified()) {
            log.debug({ func: 'UpdateAvailableReports' }, 'Report Type is unchanged from DB copy');
            dbValue.unchanged = true;

            return q.resolve(dbValue);
        }
        log.debug({ func: 'UpdateAvailableReports' }, 'Updating a new report type for SKU: %s', newReport.sku);
    }

    return q.ninvoke(report, 'save').then(
        function (success) {
            var doc = success[0];
            var rows = success.length > 1 ? success[1] : -1;
            console.log('Saved %d rows, returning report sku %s, version %d', rows, doc.sku, doc.__v);
            return q.resolve(doc);
        }, function (err) {
            return q.reject(err);
        });
}



/**
 * @alias report.applicantStatus
 *
 * Expected res.applicant
 * applicant: {
 *   "_id": "554ad1e3456d47ed061a08aa",
 *   "remoteId": 45958,
 *   "user": "554ad1e3456d47ed061a08a9",
 *   "__v": 0,
 *   "modified": "2015-05-07T02:45:55.702Z",
 *   "created": "2015-05-07T02:45:55.664Z",
 *   "reports": [],
 *   "governmentId": "",
 *   "remoteSystem": "everifile",
 *   "applicantId": 45958,
 *   "id": "554ad1e3456d47ed061a08aa"
 * }
 */
function CheckApplicantReportStatus(req, res, next) {
    log.debug({ func: 'CheckApplicantReportStatus' }, 'START');

    var remoteId = req.remoteApplicantId || req.applicant && req.applicant.remoteId;

    log.trace({ func: 'CheckApplicantReportStatus', remoteId: remoteId }, 'Looking up Applicant Report(s) Status');

    return everifile.GetSession().then(
        function (session) {
            everifile.GetReportStatusByApplicant(session, remoteId)
                .then(function (reportStatus) {
                    log.info({ func: 'CheckApplicantReportStatus', result: reportStatus }, 'Got Return response');

                    // Expected Report Status Response:
                    // ReportStatus = {
                    //     'reports': [{
                    //         'id': 93651,
                    //         'startDate': 1421384400000,
                    //         'completedDate': 1421691798000,
                    //         'report': {'sku': 'MVRDOM'},
                    //         'reportCheckStatus': {'timestamp': 1421691798000, 'status': 'COMPLETED'}
                    //     }], 'applicant': {'id': 45958}
                    // }

                    if (reportStatus.applicant.id !== req.applicant.remoteId) {
                        return res.status(500).send({
                            message: 'Mismatched or missing remote applicant'
                        });
                    }

                    _.each(reportStatus.reports, function (remoteReport) {
                        log.info({
                            func: 'CheckApplicantReportStatus',
                            result: remoteReport
                        }, 'Looking at remote Report Status');
                        var localReport = _.find(req.applicant.reports, { remoteReportSkus: remoteReport.report.sku });

                        if (!!localReport) {
                            log.info({
                                func: 'CheckApplicantReportStatus',
                                result: localReport
                            }, 'Comparing with local Report Status');
                            _.extend(localReport.status, remoteReport.reportCheckStatus.status);
                            log.info({
                                func: 'CheckApplicantReportStatus',
                                result: localReport
                            }, 'Extended local Report Status');

                        }
                        else {
                            log.warn('No Local Report Stored for applicant - saving in place');


                        }
                    });

                    res.json(req.applicant);

                });
        })
        .catch(function (error) {
            log.debug({ func: 'CreateNewReport' }, 'failed due to error: %j', error);
            next(error);
        });
}

function queryForReports(query) {
    return Bgcheck.find(query)
        .exec()
        .then(function (bgCheckResults) {

            log.debug({
                func: 'ListAllReports',
                query: query
            }, 'Found %d BackgroundCheck records in the db for query', bgCheckResults.length);

            log.trace({
                bgchecks: bgCheckResults,
                type: typeof bgCheckResults
            }, 'Logging full BG Check Results object');

            return bgCheckResults || [];
        });
}

function ListAllReports(req, res, next) {

    var query = req.query || {};
    req.log.debug({ func: 'listAllReports', query: query }, 'Querying for reports');

    queryForReports(query)
        .then(function (bgCheckResults) {
            req.reports = bgCheckResults || [];

            res.json(req.reports);
        }, function (err) {
            req.log.error(err, 'Error loading reports');

            res.status(400).send({ error: err, message: 'Unable to load reports' });
        });

}

/**
 * @alias report.status
 */
function CheckRemoteReportStatus(req, res, next) {
    var remoteId = req.reportId;

    return everifile.GetSession().then(
        function (session) {
            everifile.RunReport(session, remoteId).then(
                function () {

                }
                );
        },
        function (error) {
            log.debug({ func: 'CreateNewReport' }, 'failed due to error: %j', error);
            next(error);
        });
}

/**
 * @alias report.get
 */
function GetReportData(req, res, next) {
    var remoteId = req.reportId;

    return everifile.GetSession().then(
        function (session) {
            everifile.RunReport(session, remoteId).then(
                function (bgReport) {
                }
                );
        },
        function (error) {
            log.debug({ func: 'CreateNewReport' }, 'failed due to error: %j', error);
            next(error);
        });
}

/**
 * @alias report.loadPDF
 */
function LoadPDFData(req, res, next) {
    var remoteId = req.applicantId;

    return everifile.GetSession().then(
        function (session) {
            everifile.GetSummaryReportPDF(session, remoteId).then(
                function (bgReport) {

                    res.type(bgReport.contentType);
                    res.header('Content-Disposition', bgReport.headers['content-disposition']);
                    res.header('transfer-encoding', bgReport.headers['transfer-encoding']);
                    res.write(bgReport.response.raw_body);// jshint ignore:line
                    res.end();

                    //res.type(bgReport.contentType);
                    //res.header('Content-Disposition', bgReport.headers['content-disposition']);
                    //res.header('transfer-encoding', bgReport.headers['transfer-encoding']);
                    //res.send(bgReport.content);
                }
                );
        },
        function (error) {
            log.debug({ func: 'CreateNewReport' }, 'failed due to error: %j', error);
            next(error);
        });
}


function doReportSync(req, res, next) {

    var data = {
        results: {
            startCt: 0,
            newStatus: 0,
            addedData: 0,
            addedPDF: 0,
            errors: []
        }
    };

    req.log.debug({ func: 'doReportSync' }, 'Starting Report Sync');


    queryForReports({ isComplete: false })
        .then(function (reports) {
            req.log.debug({ func: 'doReportSync', step: 1 }, 'got reports', reports);

            data.reports = reports;
            data.results.startCt = reports.length;

            req.log.debug({ func: 'doReportSync', step: 1 }, 'Loaded %d reports to check sync', reports.length);

            return everifile.GetSession();
        })
        .then(function (session) {
            req.log.debug({ func: 'doReportSync', step: 2 }, 'got eVerifile session');
            data.session = session;
            var updates = _.map(data.reports, function (report) {
                req.log.debug({ func: 'doReportSync', step: 2 }, 'Looking up report Status for report: ', report);

                return everifile.GetReportStatus(session, report.remoteId)
                    .then(function (status) {
                        req.log.debug({ func: 'doReportSync', step: 2 }, 'Got Report Status: ', status);
                        req.log.debug({ func: 'doReportSync', step: 2 }, 'Report.addStatus isFunction: ', _.isFunction(report.addStatus));

                        if (report.addStatus(status)) {
                            req.log.debug({ func: 'doReportSync', step: 2 }, 'adding new status');
                            data.results.newStatus++;
                            return report.save();
                        }

                        req.log.debug({ func: 'doReportSync', step: 2 }, 'Status has already been added');


                        return q(report);
                    })
                    .catch(function (err) {
                        req.log.error({ func: 'doReportSync', error: err }, 'Error while updating remote report status');

                        data.results.errors.push(err);

                        return q(report);
                    });


            });

            return q.all(updates);
        })
        .then(function (reports) {

            req.log.debug({ func: 'doReportSync', step: 3 }, 'Completed Report Sync for %d reports', reports.length);

            var completeReports = _.where(reports, { isComplete: true });
            req.log.debug({ func: 'doReportSync', step: 3 }, 'Now looking at %d completeReports', completeReports.length);


            return q.all(_.map(completeReports,
                function (report) {
                    if (_.isEmpty(report.data) || _.isEmpty(report.data.xml)) {
                        req.log.debug({ func: 'doReportSync', step: 3, report: report }, 'Report Data is currently empty for report');

                        return everifile.GetRawReport(data.session, report.remoteId)
                            .then(function (reportData) {
                                req.log.debug({ func: 'doReportSync', step: 3, report: reportData }, 'Saving Report Data');

                                report.data = {
                                    xml: reportData.response.universal.xmlData,
                                    raw: reportData.response.universal.reportDisplayData
                                };

                                data.results.addedData++;

                                return report.save();
                            })
                            .catch(function (err) {
                                req.log.error({
                                    func: 'doReportSync',
                                    error: err
                                }, 'Error while retrieving raw report data');

                                data.results.errors.push(err);

                                return q(report);
                            });
                    }

                    req.log.debug({ func: 'doReportSync', step: 3, data: report.data }, 'Report Data is already present');


                    return q(report);
                }));
        })
        .then(function (reports) {
            req.log.debug({ func: 'doReportSync', step: 4 }, 'Completed Report Sync for %d reports', reports.length);

            var completeReports = _.where(reports, { isComplete: true });
            req.log.debug({ func: 'doReportSync', step: 4 }, 'Now looking at %d completeReports', completeReports.length);

            return q.all(_.map(completeReports,
                function (report) {
                    if (_.isEmpty(report.file) || _.isEmpty(report.file.url)) {
                        req.log.debug({ func: 'doReportSync', step: 4, report: report }, 'Report File is currently empty for report');

                        return everifile.GetSummaryReportPDF(data.session, report.remoteApplicantId)
                            .then(function (reportData) {
                                req.log.debug({ func: 'doReportSync', step: 4, report: reportData.headers }, 'Saving PDF Report Data');

                                req.log.debug({
                                    func: 'doReportSync',
                                    report: reportData.headers
                                }, 'Recieved new PDF Report File');

                                reportData.isSecure = true;

                                return fileUploader.saveContentToCloud(reportData);
                            }, function (err) {
                                // Catches error while Retreiving PDF Report
                                req.log.error({
                                    func: 'doReportSync',
                                    error: err
                                }, 'Error while retrieving PDF report data');

                                data.results.errors.push(err);

                                return report;
                            })
                            .then(function (savedFile) {
                                req.log.info({
                                    func: 'doReportSync',
                                    report: report.remoteId,
                                    file: savedFile
                                }, 'Saved file to Report');

                                report.file = savedFile;
                                data.results.addedPDF++;

                                return report.save();
                            }, function (err) {
                                // Catches error from fileUploader.saveContentToCloud
                                req.log.error({
                                    func: 'doReportSync',
                                    error: err
                                }, 'Alternate fail output :(');

                                return q.reject(err);

                            })
                            .catch(function (err) {
                                req.log.error({
                                    func: 'doReportSync',
                                    error: err
                                }, 'Failed to save file to report');

                                return q.reject(err);
                            });
                    }
                    req.log.debug({ func: 'doReportSync', step: 4, file: report.file }, 'Report File is already present');

                    return q(report);
                }));
        })
        .then(function (final) {
            req.log.debug({ func: 'doReportSync', results: data.results }, 'Completed Sync');

            res.json(data.results);
        })
        .then(undefined, function (err) {
            req.log.error({ func: 'doReportSync', error: err });
            next(err);
        });
}

/**
 * @alias report.create
 */
function CreateNewReport(req, res, next) {

    var bgcheck = new Bgcheck({
        user: req.user,
        remoteApplicantId: req.applicant.remoteId,
        localReportSku: req.reportType.sku,
        remoteReportSkus: req.reportType.skus,
        paymentInfo: { success: req.paymentResult.success, transactionId: req.paymentResult.transaction.id },
        status: 'PAID'
    });

    req.log.debug({ func: 'PostNonce' }, 'Creating bg check record: %j', bgcheck);

    var saveData = bgcheck.save()
        .then(
            function (savedResult) {
                req.bgcheck = savedResult;

                // bgcheck was saved successfully
                // update teh applicant's record
                var applicant = req.applicant;
                applicant.reports.push(bgcheck);

                req.log.debug({ func: 'PostNonce' }, 'pushing bg check to applicant reports', req.applicant.reports);

                return applicant.save();
            })
        .then(
            function (savedApplicant) {
                req.applicant = savedApplicant;

                return savedApplicant;
            })
        .catch(
            function (err) {
                req.log.debug({ func: 'PostNonce' }, 'Unable to save due to error: %j', err);
                res.status(400).send({
                    message: err.message
                });

                return q.reject();
            });

    return saveData.then(placeReportOrder).catch(function (error) {
        req.log.error({ func: 'CreateNewReport', err: error }, 'failed due to error');
        next(error);
    });
    
    /// Scoped Functions

    function placeReportOrder(savedApplicant) {

        var bgcheck = req.bgcheck;

        req.log.debug({ func: 'CreateNewReport.placeReportOrder' }, 'START for bgcheck %j', bgcheck);

        return everifile.GetSession()
            .then(
                function (session) {

                    req.log.debug({ func: 'CreateNewReport.placeReportOrder' }, 'Local "%s" report has remote SKUs: "%j"', bgcheck.localReportSku, req.reportType.skus);

                    var deferrals = _.map(req.reportType.skus, function (remoteSku) {

                        var remoteApplicant = bgcheck.remoteApplicantId;

                        return everifile
                            .RunReport(session, remoteSku, remoteApplicant)
                            .then(
                                function (remoteReportStatus) {
                                    req.log.debug({ func: 'CreateNewReport.placeReportOrder' }, 'Created remote report: %j', remoteReportStatus);

                                    if (_.endsWith('000', remoteReportStatus.toString())) {
                                        req.log.debug({ func: 'CreateNewReport.placeReportOrder', raw: remoteReportStatus.timestamp, divided: remoteReportStatus.timestamp / 1000 }, 'Dividing timestamp by 1000');
                                        remoteReportStatus.timestamp = remoteReportStatus.timestamp / 1000;
                                    }

                                    var status = {
                                        remoteId: remoteReportStatus.remoteId,
                                        sku: remoteReportStatus.reportSku,
                                        value: remoteReportStatus.status.toUpperCase(),
                                        requiredData: remoteReportStatus.requiredData,
                                        completed: remoteReportStatus.completed,
                                        timestamp: remoteReportStatus.timestamp
                                    };

                                    req.log.debug({ func: 'CreateNewReport.placeReportOrder', status: status }, 'Returning Remote Status');

                                    return status;
                                });
                    });
                })
            .then(
                function processStatusUpdates(settledStatusUpdates) {
                    console.log('Finished Report requests!');

                    _.each(settledStatusUpdates, function (statusUpdate) {

                        req.log.debug({ func: 'CreateNewReport.processStatusUpdates', statuses: bgcheck.statuses, statusUpdate: statusUpdate }, 'Pushing new Remote Status');
                        bgcheck.statuses.push(statusUpdate.value);
                    });

                    //bgcheck.statuses = bgcheck.statuses.concat(settledStatusUpdates);
                    req.log.debug({ func: 'CreateNewReport.processStatusUpdates', bgcheck: bgcheck }, 'Saving BGCheck Object');

                    return bgcheck.save()
                        .then(function (successResult) {
                            req.log.info({ func: 'CreateNewReport.processStatusUpdates', result: successResult }, 'Successfully saved and updated bgchecks');
                            res.json(successResult);
                        })
                        .catch(function (err) {
                            req.log.error({ func: 'CreateNewReport.processStatusUpdates', err: err }, 'Failed to save due to `%s`', errorHandler.getErrorMessage(err));
                            res.status(500).send({ message: errorHandler.getErrorMessage(err) });
                            return;
                        });
                    // TODO, more!
                })
            .catch(function (err) {
                req.log.error({ func: 'CreateNewReport.catch', err: err }, 'Create New Report failed');
                
                if (!!req.bgcheck) {
                    res.json(req.bgcheck);
                } else {
                    res.status(500).send({ message: errorHandler.getErrorMessage(err) });
                }
            });
    }
}


function rerunReport(req, res, next) {
    var remoteId = req.applicantId;

    return everifile.GetSession().then(
        function (session) {
            everifile.RunReport(session, 'MVRDOM', 44679).then(
                function (bgReport) {
                    log.debug({ func: 'rerunReport' }, 'Created remote report: %j', bgReport);

                    bgReport.save(function (err) {
                        if (err) {
                            return res.status(500).send({ message: errorHandler.getErrorMessage(err) });
                        }

                        res.json(bgReport);
                    });
                }
                );
        },
        function (error) {
            log.debug({ func: 'rerunReport' }, 'failed due to error: %j', error);
            next(error);
        });
}



/** Section : Report Middleware --------------------------------------------------------- **/
function reportByID(req, res, next, id) {
    Bgcheck.findById(id)
        .populate('user', 'displayName')
        .exec(function (err, bgcheck) {
            if (err) {
                req.log.error({ error: err }, 'Error looking up report by id `%s`', id);
                return next(err);
            }
            req.bgcheck = bgcheck;
            next();
        });
}
