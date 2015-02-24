'use strict';

/**
 * Module dependencies.
 */
var mongoose    = require('mongoose'),
errorHandler    = require('../../../core/server/controllers/errors.server.controller'),
Bgcheck         = mongoose.model('BackgroundReport'),
ReportType      = mongoose.model('ReportType'),
ReportApplicant = mongoose.model('ReportApplicant'),
Q               = require('q'),
everifile       = require('./everifile.server.service'),
path            = require('path'),
constants       = require(path.resolve('./modules/core/server/models/outset.constants')),
_               = require('lodash');


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
    create: CreateNewReport,
    applicantStatus: CheckApplicantReportStatus,
    status: CheckReportStatus,
    get: GetReportData,
    loadPDF: LoadPDFData // this should only be used internally?
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
                return next(err);
            }
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

function GetReportApplicant(req, res, next) {
    var query;

    if (req.remoteApplicantId || req.query.remoteApplicantId) {
        console.log('[GetReportApplicant] Searching based on req.remoteId');
        query = {remoteId: req.remoteApplicantId || req.query.remoteApplicantId};
    } else if (req.applicantId || req.query.applicantId) {
        console.log('[GetReportApplicant] Searching based on req.applicantId');
        query = {_id: req.applicantId || req.query.applicantId};
    } else if (req.userId) {
        console.log('[GetReportApplicant] Searching based on req.userId');
        query = {user: mongoose.Types.ObjectId(req.userId)};
    } else if (req.user) {
        console.log('[GetReportApplicant] Searching based on req.user');
        query = {user: req.user._id};
    }

    console.log('[GetReportApplicant] Searching for report applicant with query %j', query);

    ReportApplicant.findOne(query)
        .exec(function (err, localApplicant) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }

            console.log('[GetReportApplicant] Result: %j', localApplicant);

            req.applicant = localApplicant;
            next();
        });

}

/**
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
            );
        }, function (error) {
            console.log('[GetRemoteApplicantData] failed due to error: %j', error);
            next(error);
        });
}

function ReadReportApplicant(req, res) {

    if (!req.applicant && !req.remoteApplicant) {
        return res.status(404).send({
            message: 'No local or remote applicant found'
        });
    }

    console.log('[ReportApplicant.read] Combining values from req.applicant[%s] and req.remoteApplicant[%s]', !!req.remoteApplicant ? 'X' : ' ', !!req.applicant ? 'X' : ' ');

    var retval = _.extend(req.remoteApplicant, (req.applicant || {}).toObject());

    console.log('[ReportApplicant.read] Combined Applicant: %j', retval);

    res.json(retval);
}

/** SECTION : Report Manipulation ------------------------------------------------------ **/
function CreateNewReport(req, res, next) {

    var deferred = Q.defer();

    var bgcheck = new Bgcheck({
        user: req.user,
        remoteApplicantId: req.applicant.remoteId,
        localReportSku: req.reportType.sku,
        remoteReportSkus: req.reportType.skus,
        paymentInfo: { success: req.paymentResult.success, transactionId: req.paymentResult.transaction.id },
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

module.exports.rerunReport = function ReRunReport(req, res, next) {
    var remoteId = req.applicantId;

    everifile.GetSession().then(
        function (session) {
            everifile.RunReport(session, "MVRDOM", 44679).then(
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

function CheckApplicantReportStatus(req, res, next) {
    var remoteId = req.applicantId;

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

function CheckReportStatus(req, res, next) {
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

function LoadPDFData(req, res, next) {
    var remoteId = req.applicantId;

    everifile.GetSession().then(
        function (session) {
            everifile.GetSummaryReportPDF(session, remoteId).then(
                function (bgReport) {

                    res.type(bgReport.contentType);
                    res.header('Content-Disposition', bgReport.headers['content-disposition']);
                    res.header('transfer-encoding', bgReport.headers['transfer-encoding']);
                    res.write(bgReport.response.raw_body);
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

/** Section : Report Middleware --------------------------------------------------------- **/
function reportByID(req, res, next, id) {
    Bgcheck.findById(id)
        .populate('user', 'displayName')
        .exec(function (err, bgcheck) {
            if (err) {
                return next(err);
            }
            req.bgcheck = bgcheck;
            next();
        });
}
