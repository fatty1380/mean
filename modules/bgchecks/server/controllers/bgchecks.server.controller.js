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
_               = require('lodash');


exports.availableReportTypes = availableReportTypes;


exports.UpdateReportDefinitionsFromServer = UpdateReportDefinitionsFromServer;
exports.SaveUpdatedReportDefinitions = SaveUpdatedReportDefinitions;

exports.applicant = {
    create: CreateNewRemoteApplicant,
    save: SaveNewApplicant,
    list: GetAllRemoteApplicants,
    getRemote: GetRemoteApplicantData,
    get: GetReportApplicant,
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
    console.log('[availableReportTypes] loading all available report types');
    ReportType.find({'enabled': true})
        //.populate('fields')
        .exec(function (err, reportTypes) {
            if (err) {
                return res.status(400).send({
                    message: err.message,
                    error: err
                });
            }

            console.log('[availableReportTypes] loaded reports: %j', reportTypes);

            res.json(reportTypes);
        });
}

function requestReport(req, res) {
    var user = req.user;

    var reportOptions = getReportInfo(user);

    req.reportType = reportOptions.reportType;
    req.remoteApplicantId = reportOptions.remoteApplicantId;


}

function getReportInfo(user) {
    return {
        remoteApplicantId: 54,
        reportType: 'OFAC'
    };
}

/**
 * Create a Bgcheck
 */
function create(req, res) {
    var bgcheck = new Bgcheck(req.body);
    bgcheck.user = req.user;

    bgcheck.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(bgcheck);
        }
    });
}

/**
 * Update a Bgcheck
 */
function update(req, res) {
    var bgcheck = req.bgcheck;

    bgcheck = _.extend(bgcheck, req.body);

    bgcheck.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(bgcheck);
        }
    });
}

/**
 * Delete an Bgcheck
 */
exports.delete = function (req, res) {
    var bgcheck = req.bgcheck;

    bgcheck.remove(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(bgcheck);
        }
    });
};

/**
 * List of Bgchecks
 */
exports.listByUser = function (req, res) {

    if (req.params.userId) {
        req.query = {user: req.params.userId};
    }

    debugger;
    this.list(req, res);
};


/** Router Middleware ------------------------------------------ **/

function reportBySKU(req, res, next, id) {
    console.log('Looking up report for SKU: %s', id);

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
    debugger;
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

function CreateNewRemoteApplicant(req, res, next) {

    //var applicant = {
    //    'middleName': 'Norman',
    //    'lastName': 'Smith',
    //    'nameSuffix': 'MD',
    //    'aliases': [{
    //        'lastName': 'McDonald', 'firstName': 'Ronald'
    //    }],
    //    'currentAddress': {
    //        'street2': 'Suite 200',
    //        'street1': '101 Oak Street',
    //        'postalCode': '30302',
    //        'state': 'georgia',
    //        'country': 'united_states',
    //        'city': 'Atlanta'
    //    },
    //    'governmentId': '201211141',
    //    'gender': 'male',
    //    'birthDate': 19780101,
    //    'firstName': 'Bob',
    //    'hasApplicantRequestedForReceivingReport': 'true'
    //};
    //console.warn('[CreateNewRemoteApplicant] Creating temporary applicant');

    if (!req.user) {


        console.warn('[CreateNewRemoteApplicant] No User, no problem!');
    }

    var applicant = req.body;

    everifile.GetSession().then(
        function (session) {
            everifile.CreateApplicant(session, applicant).then(
                function (applicant) {
                    console.log('[CreateNewRemoteApplicant] Got applicant data from eVerifile: %j', applicant);

                    req.remoteApplicant = applicant;

                    next();
                },
                function (reject) {
                    // Catch the error, check for 404/401
                }
            );
        }, function (error) {
            console.log('[GetAllRemoteApplicants] failed due to error: %j', error);
            next(error);
        });
}

function SaveNewApplicant(req, res, next) {

    var applicant = new ReportApplicant(req.remoteApplicant);

    applicant.user = req.user;
    applicant.remoteId = req.remoteApplicant.applicantId;

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
                    // Catch the error, check for 404/401
                }
            );
        }, function (error) {
            console.log('[GetAllRemoteApplicants] failed due to error: %j', error);
            next(error);
        });
}

function GetReportApplicant(req, res, next) {
    var query;

    if (req.remoteApplicantId) {
        console.log('[GetReportApplicant] Searching based on req.applicantId');
        query = {remoteId: req.remoteApplicantId};
    } else if (req.userId) {
        console.log('[GetReportApplicant] Searching based on req.userId');
        query = {user: req.userId};
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

            req.applicant = localApplicant;
            req.remoteApplicantId = (localApplicant || {}).remoteId;
            next();
        });

}

function GetRemoteApplicantData(req, res, next) {
    if (!req.user && !req.applicant && !req.remoteApplicantId) {
        var message = 'Incoming request must have some way to determine the remoteApplicantId';
        console.error('[GetRemoteApplicantData] %s', message);
        return next(new Error(message));
    }

    if (!req.remoteApplicantId) {
        /**
         * In order to find a remote applicant, we must assume that we have saved that
         * data into the local collectino of report applicants. If this is true, the object
         * req.applicant will be populated from the previous method: GetReportApplicant.
         *
         * If it is not populated, we will assume that no remote applicant exists and one
         * should be created.
         *
         * In the future, we may choose to search for applicants, but maybe not.
          */


        if (req.applicant && req.applicant.remoteId) {
            console.log('Using req.applicant remoteId: %s', req.applicant.remoteId);
            req.remoteApplicantId = req.applicant.remoteId;
        } else {
            console.log('[GetRemoteApplicantData] Unable to search for applicant from request data');
            req.remoteApplicant = null;
            return next();
        }
    } else {
        console.log('Using req.remoteApplicantId remoteId: %s', req.remoteApplicantId);
    }

    var id = req.remoteApplicantId;

    everifile.GetSession().then(
        function (session) {
            everifile.GetApplicant(session, id).then(
                function (remoteApplicant) {

                    console.log('[GetRemoteApplicantData] Got applicant model from eVerifile: %j', remoteApplicant);
                    req.applicant.remoteData = remoteApplicant;
                    req.remoteApplicant = remoteApplicant;
                },
                function (reject) {
                    debugger;
                    // Catch the error, check for 404/401
                }
            );
        }, function (error) {
            console.log('UpdateReportDefinitionsFromServer failed due to error: %j', error);
            next(error);
        });
}

function ReadReportApplicant(req, res) {
    console.log('[ReportApplicant.read] Returning applicant %j', req.applicant);

    if (!req.applicant) {
        return res.status(404).send({
            message: 'No applicant found'
        });
    }

    if (!!req.remoteApplicant && !req.applicant.remoteData) {
        req.applicant.remoteData = req.remoteApplicant;
    }

    res.json(req.applicant);
}

/** SECTION : Report Manipulation ------------------------------------------------------ **/
function CreateNewReport(req, res, next) {

    var bgcheck = new Bgcheck(req.body);
    bgcheck.user = req.user;

    everifile.GetSession().then(
        function (session) {
            everifile.RunReport(session, bgcheck).then(
                function (bgReport) {
                    console.log('[CreateNewReport] Created remote report: %j', bgReport);

                    bgReport.save(function (err) {
                        if (err) {
                            return res.status(400).send({
                                message: errorHandler.getErrorMessage(err)
                            });
                        }

                        res.jsonp(bgReport);
                    });
                }
            );
        },
        function (error) {
            console.log('[CreateNewReport] failed due to error: %j', error);
            next(error);
        });

}
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
