'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
errorHandler = require('../../../core/server/controllers/errors.server.controller'),
Bgcheck      = mongoose.model('BackgroundReport'),
ReportType   = mongoose.model('ReportType'),
Q            = require('q'),
everifile    = require('./everifile.server.service'),
_            = require('lodash');


exports.availableReportTypes = availableReportTypes;
exports.updateReport = updateReport;


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


function availableReportTypes(req, res, next) {
    console.log('[availableReportTypes] loading all available report types');
    ReportType.find({'enabled': true})
        .populate('fields')
        .exec(function (err, reportTypes) {
            if (err) {
                return res.status(400).send({
                    message: err.message,
                    error: err
                });
            }

            console.log('[availableReportTypes] loaded reports: %j', reportTypes);

            debugger;
            res.json(reportTypes);
        });
}

exports.requestReport = function (req, res) {
    var user = req.user;

    var reportOptions = getReportInfo(user);

    req.reportType = reportOptions.reportType;
    req.applicantId = reportOptions.applicantId;


};

function getReportInfo(user) {
    return {
        applicantId: 54,
        reportType: 'OFAC'
    };
}

/**
 * Create a Bgcheck
 */
exports.create = function (req, res) {
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
};

exports.readApplicant = function (req, res) {

    if (!req.applicant) {
        return res.status(404).send({
            message: 'No applicant found'
        });
    }

    res.jsonp(req.applicant);
};

/**
 * Update a Bgcheck
 */
exports.update = function (req, res) {
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
};

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

/**
 * Bgcheck middleware
 */
exports.bgcheckByID = function (req, res, next, id) {
    Bgcheck.findById(id)
        .populate('user', 'displayName')
        .exec(function (err, bgcheck) {
            if (err) {
                return next(err);
            }
            req.bgcheck = bgcheck;
            next();
        });
};

function updateReport(req, res, next) {

    if (!req.reportType) {
        console.log('[updateReport] No Report Type present in request, error!');

        return res.status(404).send({
            message: 'No Report Type present in request, error!'
        });
    }

    var reportType = req.reportType;
    var sku = req.sku = req.reportType.sku;
    var newFields = req.fieldDefs;

    console.log('Updating Report "%s"', sku);

    var deferred = Q.defer();

    console.log('Current fields for report %s: %o', sku, reportType.fields);
    console.log('Updating with new data: %o', newFields);

    _.extend(reportType.fields, newFields);
    console.log('Updating to extended version: %o', newFields);

    reportType.save(function (err) {
        debugger;

        if (err) {
            console.log('[updateReport] Error in db save');
            return deferred.reject(err);
        }

        console.log('[handlePromiseResponse] Returning report def : %o', reportType);

        return deferred.resolve(reportType);
    });

    deferred.promise.then(function (success) {
        console.log('[handlePromiseResponse] Got updated report: %o', success);
        debugger;
        req.reportType = success;

        console.log('DIDIT: Setting the fields onto the report SKUs in teh DB');

        next();

    }, function (reject) {
        debugger;
        return next(new Error(reject));
    });
}

exports.reportBySKU = function reportBySKU(req, res, next, id) {
    console.log('Looking up report for SKU: %s', id);

    ReportType.findOne({'sku': id})
        .populate('fields')
        .exec(function (err, reportType) {
            if (err) {
                console.log('ReportBySKU] ERROR: ', err);
                return next(err);
            }

            console.log('got report for sku [%s]: %o', id, reportType);

            req.reportType = reportType;
            next();
        });
};

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

    if(!!req.failures && req.failures.length > 0) {
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
exports.UpdateReportDefinitionsFromServer = function UpdateReportDefinitionsFromServer(req, res, next) {

    var skus = [''];

    everifile
        .GetSession()
        .then(function (session) {
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
};


exports.SaveUpdatedReportDefinitions = function SaveUpdatedReportDefinitions(req, res, next) {

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


};

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
