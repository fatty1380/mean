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
    Q = require('q'),
    everifile = require('./everifile.server.service'),
    constants = require(path.resolve('./modules/core/server/models/outset.constants')),
    fileUploader = require(path.resolve('./modules/core/server/controllers/s3FileUpload.server.controller')),
    _ = require('lodash'),
    log = require(path.resolve('./config/lib/logger')).child({
        module: 'bgchecks',
        file: 'bgchecks.server.controller'
    });


exports.availableReportTypes = availableReportTypes;


exports.UpdateReportDefinitionsFromServer = UpdateReportDefinitionsFromServer;
exports.SaveUpdatedReportDefinitions = SaveUpdatedReportDefinitions;

exports.applicant = {
    list: GetAllRemoteApplicants,
    create: UpsertRemoteApplicant,
    save: SaveNewApplicant,
    get: GetReportApplicant, /* Searches for local ReportApplicant and sets req.applicant */
    getRemote: GetRemoteApplicantData,
    read: ReadReportApplicant
};

exports.report = {
    list: ListAllReports,
    create: CreateNewReport,
    applicantStatus: CheckApplicantReportStatus,
    status: CheckRemoteReportStatus,
    get: GetReportData,
    loadPDF: LoadPDFData, // this should only be used internally?
    sync: doReportSync
};

/** Bound Router Middleware ------------------------------------------ **/
exports.reportDefinitionBySKU = reportBySKU;
exports.applicantByID = applicantByID;
exports.reportByID = reportByID;

exports.list = {
    reports: function (req, res) {
        return listHandler(req, res, 'report types', req.reportTypes);
    },
    fields: function (req, res) {
        return listHandler(req, res, 'report fields', req.fieldDefs);
    }
};
exports.read = {
    report: function (req, res) {
        return readHandler(req, res, 'report types', req.reportType);
    },
    fields: function (req, res) {
        return readHandler(req, res, 'report fields', req.reportType.fields);
    }
};

/** BEGIN : Implementation -------------------------------------------- **/

function availableReportTypes(req, res, next) {
    console.log('[availableReportTypes] request query: %j', req.query);
    var query;
    if (req.query.returnAll) {
        query = {};
        console.log('[availableReportTypes] loading all report types');
    }
    else {
        query = {'enabled': true};
        console.log('[availableReportTypes] loading all enabled report types');
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

            console.log('[availableReportTypes] loaded %d reports', reportTypes && reportTypes.length || -1);

            res.json(reportTypes);
        });
}

/** Router Middleware ------------------------------------------ **/

function reportBySKU(req, res, next, id) {
    console.log('Looking up report for SKU: %s', id);

    var rpt = _.find(constants.reportPackages, {'sku': id});

    if (rpt) {
        console.log('Found hardcoded report type for SKU %s ... Returning', id);

        req.reportType = rpt;
        return next();
    }

    ReportType.findOne({'sku': id})
        .exec(function (err, reportType) {
            if (err) {
                console.log('ReportBySKU] ERROR: ', err);
                return next(err);
            }

            console.log('got report for sku [%s]: %o', id, reportType);

            req.reportType = reportType;
            next();
        });

}

/**
 * Bgcheck middleware
 */

function applicantByID(req, res, next, id) {
    req.applicantId = id;
    ReportApplicant
        .findById(id)
        .exec(function (err, applicant) {
            if (err) {
                log.error(err, 'Failed to lookup applicant by Id %s', id);
                return next(err);
            }

            log.debug({func: 'applicantById', applicant: applicant}, 'Found Applicant by ID');
            req.applicant = applicant;
            next();
        });
}

/**
 * Bgcheck authorization middleware
 */
exports.hasAuthorization = function (req, res, next) {
    if (req.bgcheck.user.id === req.user.id) {
        return next();
    }
    else {
        return res.status(403).send('User is not authorized');
    }
};

/**
 * Helper Functions
 */


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
        return res.json({reports: vals, failures: req.failures});
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

    everifile.GetSession().then(
        function (session) {
            everifile.GetReportTypeDefinitions(session, true, true).then(
                function (results) {
                    req.reportTypes = handleSettledPromises(results, req, 'reportTypes', 'failures');
                    next();
                }
            );
        }, function (error) {
            console.log('UpdateReportDefinitionsFromServer failed due to error: %j', error);
            next(error);
        });
}


function SaveUpdatedReportDefinitions(req, res, next) {

    if (!req.reportTypes) {
        console.log('[SaveUpdatedReportDefinitions] No Report types present in request!');
        return next();
    }

    console.log('Got data for %d report types', req.reportTypes);

    var reportsToBeProcessed = req.reportTypes.map(generateQueries);

    console.log('[SaveUpdatedReportDefinitions] Analyzing %d of $d report types', reportsToBeProcessed.length, req.reportTypes.length);

    Q.allSettled(reportsToBeProcessed).then(
        function (processedReportTypes) {
            console.log('Ready to upsert %d report types', processedReportTypes.length);

            return Q.allSettled(processedReportTypes.map(function (preAndUpdateVals) {
                return Q.resolve(preAndUpdateVals.value).spread(reportTypeUpsert);
            }));
        },
        function (error) {
            console.error('Error reported in processing reports', error);
            Q.reject(error);
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
    console.log('[generateQueries] Querying DB for existing "%s:%s" report', reportTypeData.sku, reportTypeData.name);

    var reportQueryPromise = ReportType
        .findOne({'sku': reportTypeData.sku})
        //.populate('fields')
        .exec();

    // Resolve as array to facilitate spreading to reportTypeUpsert
    return Q.all([reportQueryPromise, Q.resolve(reportTypeData)]);
}

function reportTypeUpsert(dbValue, newReport) {

    var report;

    console.log('[reportTypeUpsert] Upserting report type with data %j', newReport);

    if (!dbValue) {
        report = new ReportType(newReport);
        console.log('[UpdateAvailableReports] Creating a new report type with data %j', newReport);
    } else {
        report = _.extend(dbValue, newReport);

        if (!dbValue.isModified()) {
            console.log('[UpdateAvailableReports] Report Type is unchanged from DB copy');
            dbValue.unchanged = true;

            return Q.resolve(dbValue);
        }
        console.log('[UpdateAvailableReports] Updating a new report type for SKU: %s', newReport.sku);
    }

    return Q.ninvoke(report, 'save').then(
        function (success) {
            var doc = success[0];
            var rows = success.length > 1 ? success[1] : -1;
            console.log('Saved %d rows, returning report sku %s, version %d', rows, doc.sku, doc.__v);
            return Q.resolve(doc);
        }, function (err) {
            return Q.reject(err);
        });
}

/** SECTION : Applicants ---------------------------------------------------- */

/**
 * @alias applicant.create
 */
function UpsertRemoteApplicant(req, res, next) {

    var formApplicantRsrc = req.body;
    var formData = formApplicantRsrc.reportSource;

    console.log('[UpserRemoteApplicant] SENSITIVE REMOVE: Form Data: $s', JSON.stringify(formData, undefined, 2));

    debugger; // check that request body has correct ssn/dlid s

    var message = 'Requesting user does not match applicant user';

    if (!req.user._id.equals(formApplicantRsrc.userId)) {
        message = message + ' (' + req.user._id + '!=' + formApplicantRsrc.userId + ')';
        console.error('[UpsertRemoteApplicant] %s', message);
        res.status(401).send({message: message});
    }

    everifile.GetSession().then(
        function (session) {
            everifile.CreateApplicant(session, formData).then(
                function (applicantUpsertResponse) {
                    console.log('[UpsertRemoteApplicant] Got applicant response from eVerifile: %j', applicantUpsertResponse);


                    req.remoteApplicant = applicantUpsertResponse;

                    if (applicantUpsertResponse.updated) {


                        ReportApplicant.findOne({
                            'remoteId': applicantUpsertResponse.applicantId,
                            'remoteSystem': 'everifile'
                        }).
                            exec(function (err, localApplicant) {
                                if (err || !localApplicant) {
                                    return res.status(400).send({
                                        message: 'Unable to find your data in our system',
                                        response: applicantUpsertResponse
                                    });
                                }

                                if (localApplicant.remoteId !== applicantUpsertResponse.applicantId) {
                                    console.error('Mismatched remoteIds between %j and %j', applicantUpsertResponse, localApplicant);
                                }

                                res.json(localApplicant);
                                return;
                            });
                    }
                    else {
                        console.log('[UpsertRemoteApplicant] Continuing to next to save teh applicant ...');
                        next();
                    }


                },
                function (reject) {
                    console.log('[UpsertRemoteApplicant] Error response: %j', reject, reject);
                    next(reject);
                }
            );
        }, function (error) {
            console.log('[GetAllRemoteApplicants] failed due to error: %j', error);
            next(error);
        });
}

/**
 * @alias applicant.save
 */
function SaveNewApplicant(req, res, next) {

    var applicantId = req.remoteApplicant && req.remoteApplicant.applicantId;

    var applicant = new ReportApplicant({
        remoteId: applicantId,
        user: req.user
    });

    applicant.save(function (err) {
        if (err) {
            console.log('Saving ReportApplicant failed with error: %j', err);
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err),
                error: err
            });
        }

        console.log('Successfully saved ReportApplicant: %j', applicant);

        applicant.remoteData = req.remoteApplicant;
        res.json(applicant);
    });
}

/**
 * @alias applicant.list
 */
function GetAllRemoteApplicants(req, res, next) {

    if (!req.user || !req.user.isAdmin) {
        var message = 'No User, No Deal - only admins here';
        console.error('[GetAllRemoteApplicants] %s', message);
        return res.status(404);
    }

    everifile.GetSession().then(
        function (session) {
            everifile.GetAllApplicants(session).then(
                function (applicantModels) {
                    console.log('[GetAllRemoteApplicants] Got %d applicant models from eVerifile');

                    res.json(applicantModels);
                },
                function (reject) {
                    console.log('[GetAllRemoteApplicants] Error response: %j', reject, reject);
                    next(reject);
                }
            );
        }, function (error) {
            console.log('[GetAllRemoteApplicants] failed due to error: %j', error);
            next(error);
        });
}

/**
 * @alias applicant.get
 */
function GetReportApplicant(req, res, next) {

    if (req.applicant && req.applicant instanceof ReportApplicant) {
        log.debug({func: 'GetReportApplicant'}, 'Applicant already loaded');

        return ReportApplicant.populate(req.applicant, {path: 'reports'})
            .then(function (success) {
                log.trace({func: GetReportApplicant}, 'Populated Reports');
                next();
            });
    }

    var query, id;

    if (!!(id = req.remoteApplicantId || req.query.remoteApplicantId)) {
        query = {remoteId: id};
    } else if (!!(id = req.applicantId || req.query.applicantId)) {
        query = {remoteId: id};
    } else if (req.userId) {
        query = {user: mongoose.Types.ObjectId(req.userId)};
    } else if (req.user) {
        query = {user: req.user._id};
    } else {
        return res.status(401).send({message: 'Unauthorized Access'});
    }

    log.debug({func: 'GetReportApplicant', query: query}, 'Loading Applicant based on query');

    ReportApplicant.findOne(query)
        .populate('reports')
        .exec(function (err, localApplicant) {
            if (err) {
                log.error(err, 'Unable to find, or error while finding ReportApplicant via query %o', query);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }

            log.trace({func: 'GetReportApplicant', applicant: localApplicant}, 'Found Local Applicant');

            req.applicant = localApplicant;
            next();
        });

}

/**
 * @alias applicant.getRemote
 *
 * In order to find a remote applicant, we must assume that we have saved that
 * data into the local collection of report applicants. If this is true, the object
 * req.applicant will be populated from the previous method: GetReportApplicant.
 *
 * If it is not populated, we will assume that no remote applicant exists and one
 * should be created.
 *
 * In the future, we may choose to search for applicants, but maybe not.
 */
function GetRemoteApplicantData(req, res, next) {
    if (!req.applicant && !req.remoteApplicantId) {
        var message = 'Cannot find applicant without access to existing remoteApplicantId';
        console.log('[GetRemoteApplicantData] %s', message);
        return next();
    }

    var id = req.remoteApplicantId || req.applicant && req.applicant.remoteId;

    if (req.remoteApplicantId) {
        console.log('Using req.remoteApplicantId remoteId source');
    } else if (id) {
        console.log('Using req.applicant for remoteId source');
    } else if (!id) {
        console.log('[GetRemoteApplicantData] Unable to search for applicant from request data');
        req.remoteApplicant = null;
        return next();
    }

    everifile.GetSession().then(
        function (session) {
            everifile.GetApplicant(session, id).then(
                function (remoteApplicant) {

                    console.log('[GetRemoteApplicantData] Got remoteApplicant info: %j', remoteApplicant);
                    req.remoteApplicant = remoteApplicant;
                    next();
                }
            ).catch(function (error) {
                    console.log('[GetRemoteApplicantData] failed due to error: %j', error);
                    next(error);
                });
        }).catch(function (error) {
            console.log('[GetRemoteApplicantData] Unable to get remote session: %j', error);
            next(error);
        });
}

///**
// * @alias applicant.read
// *
// * Reads the remoteApplicant from the response, combines it with the applicant, and returns
// * a combined (extended) version of the two;
// */
//function ReadReportApplicant(req, res) {
//
//    if (!req.applicant && !req.remoteApplicant) {
//        return res.status(404).send({
//            message: 'No local or remote applicant found'
//        });
//    }
//
//    log.debug({func: 'ReportApplicant.read'}, 'Combining values from req.applicant[%s] and req.remoteApplicant[%s]', !!req.remoteApplicant ? 'X' : ' ', !!req.applicant ? 'X' : ' ');
//
//    var retval = _.extend(req.remoteApplicant || {}, (req.applicant || {}));
//
//    log.debug({func: 'ReportApplicant.read', applicant: retval}, 'Returning Combined Applicant');
//
//    res.json(retval);
//}

/**
 * @alias applicant.read
 *
 * Reads and returns the ReportApplcant from the response;
 */
function ReadReportApplicant(req, res) {

    if (!req.applicant) {
        return res.status(404).send({
            message: 'No local applicant found'
        });
    }

    log.debug({func: 'ReportApplicant.read', applicant: req.applicant}, 'Returning Applicant');

    res.json(req.applicant);
}

/** SECTION : Report Manipulation ------------------------------------------------------ **/

/**
 * @alias report.create
 */
function CreateNewReport(req, res, next) {

    var deferred = Q.defer();

    var bgcheck = new Bgcheck({
        user: req.user,
        remoteApplicantId: req.applicant.remoteId,
        localReportSku: req.reportType.sku,
        remoteReportSkus: req.reportType.skus,
        paymentInfo: {success: req.paymentResult.success, transactionId: req.paymentResult.transaction.id},
        status: 'PAID'
    });

    console.log('[PostNonce] Creating bg check record: %j', bgcheck);

    bgcheck.save(function (err) {
        if (err) {
            console.log('[PostNonce] Unable to save due to error: %j', err);
            return res.status(400).send({
                message: err.message
            });
        }

        req.bgcheck = bgcheck;

        // bgcheck was saved successfully
        // update teh applicant's record
        var applicant = req.applicant;
        applicant.reports.push(bgcheck);

        console.log('[PostNonce] pushing bg check to applicant reports', req.applicant.reports);

        applicant.save(function (err) {
            if (err) {
                console.error('Crap, unable to save applicant %j', applicant, err);
            }

            req.applicant = applicant;
            deferred.resolve();
        });


    });

    deferred.then(function () {

        var bgcheck = req.bgcheck;

        console.log('[CreateNewReport] START for bgcheck %j', bgcheck);

        everifile.GetSession().then(
            function (session) {

                console.log('[CreateNewReport] Local "%s" report has remote SKUs: "%j"', bgcheck.localReportSku, req.reportType.skus);

                var deferrals = _.map(req.reportType.skus, function (remoteSku) {

                    var defer = Q.defer();

                    var remoteApplicant = bgcheck.remoteApplicantId;

                    everifile.RunReport(session, remoteSku, remoteApplicant).then(
                        function (remoteReportStatus) {
                            console.log('[CreateNewReport] Created remote report: %j', remoteReportStatus);

                            var status = {
                                remoteId: remoteReportStatus.remoteId,
                                sku: remoteReportStatus.reportSku,
                                value: remoteReportStatus.status.toUpperCase(),
                                requiredData: remoteReportStatus.requiredData,
                                completed: remoteReportStatus.completed,
                                timestamp: remoteReportStatus.timestamp
                            };

                            defer.resolve(status);
                        }
                    );

                    return defer.promise;
                });

                Q.allSettled(deferrals).then(function (statusUpdates) {
                    console.log('Finished Report requests!');

                    statusUpdates.map(function (statusUpdate) {
                        bgcheck.statuses.push(statusUpdate.value);
                    });

                    bgcheck.statuses = bgcheck.statuses.concat(statusUpdates);

                    bgcheck.save(function (err) {
                        if (err) {
                            console.log(errorHandler.getErrorMessage(err));
                            res.status(500).send({message: errorHandler.getErrorMessage(err)});
                            return;
                        }

                        res.json(bgcheck);
                    });
                    // TODO, more!
                });


            },
            function (error) {
                console.log('[CreateNewReport] failed due to error: %j', error);
                next(error);
            });
    });
}

/**
 * @alias NONE
 */
module.exports.rerunReport = function ReRunReport(req, res, next) {
    var remoteId = req.applicantId;

    everifile.GetSession().then(
        function (session) {
            everifile.RunReport(session, 'MVRDOM', 44679).then(
                function (bgReport) {
                    console.log('[rerunReport] Created remote report: %j', bgReport);

                    bgReport.save(function (err) {
                        if (err) {
                            return res.status(500).send({message: errorHandler.getErrorMessage(err)});
                        }

                        res.json(bgReport);
                    });
                }
            );
        },
        function (error) {
            console.log('[rerunReport] failed due to error: %j', error);
            next(error);
        });
};

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
    log.debug({func: 'CheckApplicantReportStatus'}, 'START');

    var remoteId = req.remoteApplicantId || req.applicant && req.applicant.remoteId;

    log.trace({func: 'CheckApplicantReportStatus', remoteId: remoteId}, 'Looking up Applicant Report(s) Status');

    everifile.GetSession().then(
        function (session) {
            everifile.GetReportStatusByApplicant(session, remoteId)
                .then(function (reportStatus) {
                    log.info({func: 'CheckApplicantReportStatus', result: reportStatus}, 'Got Return response');

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
                        return req.status(500).send({
                            message: 'Mismatched or missing remote applicant'
                        });
                    }

                    _.each(reportStatus.reports, function (remoteReport) {
                        log.info({
                            func: 'CheckApplicantReportStatus',
                            result: remoteReport
                        }, 'Looking at remote Report Status');
                        var localReport = _.find(req.applicant.reports, {remoteReportSkus: remoteReport.report.sku});

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
            console.log('[CreateNewReport] failed due to error: %j', error);
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
    req.log.debug({func: 'listAllReports', query: query}, 'Querying for reports');

    queryForReports(query)
        .then(function (bgCheckResults) {
            req.reports = bgCheckResults || [];

            res.json(req.reports);
        }, function (err) {
            req.log.error(err, 'Error loading reports');

            res.status(400).send({error: err, message: 'Unable to load reports'});
        });

}

/**
 * @alias report.status
 */
function CheckRemoteReportStatus(req, res, next) {
    var remoteId = req.reportId;

    everifile.GetSession().then(
        function (session) {
            everifile.RunReport(session, remoteId).then(
                function () {

                }
            );
        },
        function (error) {
            console.log('[CreateNewReport] failed due to error: %j', error);
            next(error);
        });
}

/**
 * @alias report.get
 */
function GetReportData(req, res, next) {
    var remoteId = req.reportId;

    everifile.GetSession().then(
        function (session) {
            everifile.RunReport(session, remoteId).then(
                function (bgReport) {
                }
            );
        },
        function (error) {
            console.log('[CreateNewReport] failed due to error: %j', error);
            next(error);
        });
}

/**
 * @alias report.loadPDF
 */
function LoadPDFData(req, res, next) {
    var remoteId = req.applicantId;

    everifile.GetSession().then(
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
            console.log('[CreateNewReport] failed due to error: %j', error);
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

    req.log.debug({func: 'doReportSync'}, 'Starting Report Sync');


    queryForReports({isComplete: false})
        .then(function (reports) {
            req.log.debug({func: 'doReportSync', step: 1}, 'got reports', reports);

            data.reports = reports;
            data.results.startCt = reports.length;

            req.log.debug({func: 'doReportSync', step: 1}, 'Loaded %d reports to check sync', reports.length);

            return everifile.GetSession();
        })
        .then(function (session) {
            req.log.debug({func: 'doReportSync', step: 2}, 'got eVerifile session');
            data.session = session;
            var updates = _.map(data.reports, function (report) {
                req.log.debug({func: 'doReportSync', step: 2}, 'Looking up report Status for report: ', report);

                return everifile.GetReportStatus(session, report.remoteId)
                    .then(function (status) {
                        req.log.debug({func: 'doReportSync', step: 2}, 'Got Report Status: ', status);
                        req.log.debug({func: 'doReportSync', step: 2}, 'Report.addStatus isFunction: ', _.isFunction(report.addStatus));

                        if (report.addStatus(status)) {
                            req.log.debug({func: 'doReportSync', step: 2}, 'adding new status');
                            data.results.newStatus++;
                            return report.save();
                        }

                        req.log.debug({func: 'doReportSync', step: 2}, 'Status has already been added');


                        return Q(report);
                    })
                    .catch(function (err) {
                        req.log.error({func: 'doReportSync', error: err}, 'Error while updating remote report status');

                        data.results.errors.push(err);

                        return Q(report);
                    });


            });

            return Q.all(updates);
        })
        .then(function (reports) {

            req.log.debug({func: 'doReportSync', step: 3}, 'Completed Report Sync for %d reports', reports.length);

            var completeReports = _.where(reports, {isComplete: true});
            req.log.debug({func: 'doReportSync', step: 3}, 'Now looking at %d completeReports', completeReports.length);


            return Q.all(_.map(completeReports,
                function (report) {
                    if (_.isEmpty(report.data) || _.isEmpty(report.data.xml)) {
                        req.log.debug({func: 'doReportSync', step: 3, report: report}, 'Report Data is currently empty for report');

                        return everifile.GetRawReport(data.session, report.remoteId)
                            .then(function (reportData) {
                                req.log.debug({func: 'doReportSync', step: 3, report: reportData}, 'Saving Report Data');

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

                                return Q(report);
                            });
                    }

                    req.log.debug({func: 'doReportSync', step: 3, data: report.data}, 'Report Data is already present');


                    return Q(report);
                }));
        })
        .then(function (reports) {
            req.log.debug({func: 'doReportSync', step: 4}, 'Completed Report Sync for %d reports', reports.length);

            var completeReports = _.where(reports, {isComplete: true});
            req.log.debug({func: 'doReportSync', step: 4}, 'Now looking at %d completeReports', completeReports.length);

            return Q.all(_.map(completeReports,
                function (report) {
                    if (_.isEmpty(report.file) || _.isEmpty(report.file.url) ) {
                        req.log.debug({func: 'doReportSync', step: 4, report: report}, 'Report File is currently empty for report');

                        return everifile.GetSummaryReportPDF(data.session, report.remoteApplicantId)
                            .then(function (reportData) {
                                req.log.debug({func: 'doReportSync', step: 4, report: reportData.headers}, 'Saving PDF Report Data');

                                req.log.debug({
                                    func: 'doReportSync',
                                    report: reportData.headers
                                }, 'Recieved new PDF Report File');

                                return fileUploader.saveContentToCloud(reportData)
                                    .then(function (savedFile) {
                                        req.log.info({
                                            func: 'doReportSync',
                                            report: report.remoteId,
                                            file: savedFile
                                        }, 'Saved file to Report');

                                        report.file = savedFile;
                                        data.results.addedPDF++;

                                        return report.save();
                                    }, function(err) {
                                        req.log.error({
                                            func: 'doReportSync',
                                            error: err
                                        }, 'Alternate fail output :(');

                                        return Q.reject(err);

                                    })
                                .catch(function(err) {
                                        req.log.error({
                                            func: 'doReportSync',
                                            error: err
                                        }, 'Failed to save file to report');

                                        return Q.reject(err);
                                    });
                            })
                            .catch(function (err) {
                                req.log.error({
                                    func: 'doReportSync',
                                    error: err
                                }, 'Error while retrieving PDF report data');

                                data.results.errors.push(err);

                                return Q(report);
                            });
                    }
                    req.log.debug({func: 'doReportSync', step: 4, file: report.file}, 'Report File is already present');

                    return Q(report);
                }));
        })
        .then(function (final) {
            req.log.debug({func: 'doReportSync', results: data.results}, 'Completed Sync');

            res.json(data.results);
        })
        .then(undefined, function (err) {
            req.log.error({func: 'doReportSync', error: err});
            next(err);
        });
}


/** Section : Report Middleware --------------------------------------------------------- **/
function reportByID(req, res, next, id) {
    Bgcheck.findById(id)
        .populate('user', 'displayName')
        .exec(function (err, bgcheck) {
            if (err) {
                req.log.error({error: err}, 'Error looking up report by id `%s`', id);
                return next(err);
            }
            req.bgcheck = bgcheck;
            next();
        });
}
