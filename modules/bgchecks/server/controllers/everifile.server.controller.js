'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
Bgcheck      = mongoose.model('BackgroundReport'),
ReportType   = mongoose.model('ReportType'),
unirest      = require('unirest'),
Q            = require('q'),
_            = require('lodash');

// Config
var baseUrl = 'https://renovo-api-test.everifile.com/renovo';
var username = 'api@dswheels.com';
var password = '&Hybrid$1';

var CookieJar;

exports.login = login;
exports.logout = logout;
exports.hasSession = hasSession;
exports.getApplicants = getApplicants;
exports.getApplicant = getApplicant;
exports.getPdfReport = getPdfReport;
exports.checkReportStatus = checkReportStatus;
exports.getAvailableReports = getAvailableReports;
exports.updateAvailableReports = updateAvailableReports;
exports.runReport = runReport;
exports.getReport = getReport;

function login(req, res) {

    if (!!CookieJar) {
        console.log('CookieJar already Initialized');
        return res.status(200).send({
            message: 'Session already initialized'
        });
    }

    doLogin(function (response) {

        if (response.error) {
            return res.status(400).send({
                message: response.error.message,
                reason: response.body ? JSON.parse(response.body).reason : response.error.code
            });
        }

        res.jsonp(response.body);
    });
}

function doLogin(callback) {

    // Initaalize new Cookie Jar
    var newJar = unirest.jar(true);

    // Init username/password post data
    var postData = {
        'username': username,
        'password': password
    };

    console.log('[doLogin] with credentials %j to baseUrl %s', postData, baseUrl);

    // post login request to get new session;
    unirest.post(baseUrl + '/rest/session')
        .type('json')
        .send(postData)
        .jar(newJar)
        .end(function (response) {
            console.log(response.body);

            if (response.error) {
                console.log('[doLogin] Request Errored: %j', response.error);
                newJar = null;
            } else {
                console.log('[doLogin] Success: %j', newJar);
                CookieJar = newJar;
            }

            return callback(response);
        });
}

/**
 * HasSession
 * @description Checks to see if a session exists, and requests a new one if not. Will call next if successfull, or 400 if the request errors.
 * @param req
 * @param res
 * @param next
 */
function hasSession(req, res, next) {
    console.log('[HAS SESSION] HELLO!');
    if (!CookieJar) {
        console.log('CookieJar is not Initialized');
        doLogin(function (response) {
            if (response.error) {
                return res.status(400).send({
                    message: 'unable to get session',
                    error: response.error
                });
            }

            console.log('Login Successful');
            next();
        });
    } else {

        console.log('CookieJar already initialized, continuing.');
        console.log('TODO: Check if we can find any info from the CookieJar to determine when the session expires: %j', CookieJar);
        next();
    }
}

function getApplicants(req, res) {

    unirest.get(baseUrl + '/rest/applicant')
        .jar(CookieJar)
        .end(function (response) {
            console.log(response.body);

            if (response.error) {
                return res.status(400).send({
                    message: response.error.message,
                    reason: JSON.parse(response.body).reason
                });
            }

            res.jsonp(response.body);
        });
}

function getApplicant(req, res, next, id) {

    if (!CookieJar) {
        console.log('CookieJar is not Initialized');
        return res.status(400).send({
            message: 'No session currently available'
        });
    }

    unirest.get(baseUrl + '/rest/applicant/' + id)
        .jar(CookieJar)
        .end(function (response) {
            console.log(response.body);

            if (response.error) {
                return res.status(400).send({
                    message: response.error.message,
                    reason: JSON.parse(response.body).reason
                });
            }

            req.applicant = response.body;
            next();
        });
}

function logout(req, res) {

    if (!CookieJar) {
        console.log('CookieJar is not Initialized');
        return res.status(200).send({
            message: 'Session already terminated'
        });
    }

    unirest.delete(baseUrl + '/rest/session')
        .jar(CookieJar)
        .end(function (response) {
            console.log(response.body);

            CookieJar = null;

            if (response.error) {
                return res.status(400).send({
                    message: response.error.message,
                    reason: JSON.parse(response.body).reason
                });
            }

            res.jsonp(response.body);
        });
};

/**
 *
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function getAvailableReports(req, res, next) {

    if (!CookieJar) {
        console.log('CookieJar is not Initialized');
        return res.status(400).send({
            message: 'No session currently available'
        });
    }

    console.log('[bgchecks.getAvailableReports]');
    unirest.get(baseUrl + '/rest/report')
        .jar(CookieJar)
        .end(function (response) {
            console.log(response.body);

            if (response.error) {
                return res.status(400).send({
                    message: response.error.message,
                    reason: JSON.parse(response.body).reason
                });
            }

            req.reportTypes = response.body.reports;

            next();
        });
}

function updateAvailableReports(req, res, next) {
    if (!req.reportTypes) {
        console.log('[UpdateAvailableReports] No Report types present in request, error!');

        return res.status(404).send({
            message: 'No Report types present in request, error!'
        });
    }

    var reportsToBeProcessed = req.reportTypes.filter(filterBySku).map(generateQueries);

    console.log('[UpdateAvailableReports] Analyzing %d of $d report types', reportsToBeProcessed.length, req.reportTypes.length);

    Q.allSettled(reportsToBeProcessed).then(
        function (processedReportTypes) {
            console.log('queried report types: %j', processedReportTypes);

            return Q.allSettled(processedReportTypes.map(function(theReport) {
                return Q.resolve(theReport.value).spread(insertOrUpdate);
            }));
        },
        function (error) {
            console.error('Error reported in processing reports', error);
            Q.reject(error);
        })
        .done(function (success) {
            console.log('success: %o', success);

            res.json(success);
        }, function (error) {
            console.log('error: %o', error);

            res.status(503).send({
                message: error.message,
                error: error
            });
        });

}
var enabledSKUs = ['NBDS', 'PKG_PREMIUM', 'ESCRECUP', 'MVRDOM'];

function filterBySku(reportTypeData) {
    return enabledSKUs.indexOf(reportTypeData.sku.toUpperCase()) >= 0;
}

function generateQueries(reportTypeData) {
    console.log('[generateQueries] Querying DB for existing "%s:%s" report', reportTypeData.sku, reportTypeData.name);

    var reportQueryPromise = ReportType
        .findOne({'sku': reportTypeData.sku})
        .exec();

    // Resolve as array to facilitate spreading to insertOrUpdate
    return Q.all([reportQueryPromise, Q.resolve(reportTypeData)]);
}

function insertOrUpdate(dbValue, newReport) {

    var reportTypeToSave;

    console.log('[insertOrUpdate] Upserting report type with data %j', newReport);

    if (!dbValue) {
        reportTypeToSave = new ReportType(newReport);
        console.log('[UpdateAvailableReports] Creating a new report type with data %j', newReport);
    } else {
        reportTypeToSave = _.extend(dbValue, newReport);

        if(_.isEqual(dbValue, reportTypeToSave)) {
            console.log('[UpdateAvailableReports] Report Type is unchanged from DB copy');

            return Q.resolve(reportTypeToSave);
        }
        console.log('[UpdateAvailableReports] Updating a new report type for SKU: %s', newReport.sku);
    }

    console.log('ready to save reportTypeToSave: ', reportTypeToSave);

    return Q.ninvoke(reportTypeToSave, 'save').then(
        function (report) {
            console.log('Saved %d rows, returning %j', -1, report);
            return Q.resolve(report);
        }, function (err) {
            return Q.reject(err);
        });

    return retval;
}

function runReport(req, res, next) {

    if (!CookieJar) {
        console.log('CookieJar is not Initialized');
        return res.status(400).send({
            message: 'No session currently available'
        });
    }

    console.log('[bgchecks.runReport]');
    var type = req.params.reportType || 'OFAC';
    var id = req.applicant ? req.applicant.applicantId : null || req.params.applicantId || req.query.applicantId || 54;

    unirest.post(baseUrl + '/rest/report')
        .jar(CookieJar)
        .query({
            reportSku: type,
            applicantId: id
        })
        .end(function (response) {
            console.log(response.body);
            console.log(response.error);

            if (response.error) {
                return res.status(400).send({
                    message: response.error.message,
                    reason: JSON.parse(response.body).reason
                });
            }

            res.jsonp(response.body);
        });
}

function getReport(req, res) {

    if (!CookieJar) {
        console.log('CookieJar is not Initialized');
        return res.status(400).send({
            message: 'No session currently available'
        });
    }

    console.log('[bgchecks.getReport]');

    var id = req.reportCheck.id;

    unirest.get(baseUrl + '/rest/reportCheck/' + id + '/report')
        .jar(CookieJar)
        .end(function (response) {
            console.log(response.body);

            if (response.error) {
                return res.status(400).send({
                    message: response.error.message,
                    reason: JSON.parse(response.body).reason
                });
            }

            res.jsonp(response.body);
        });
}

function getPdfReport(req, res) {

    if (!CookieJar) {
        console.log('CookieJar is not Initialized');
        return res.status(400).send({
            message: 'No session currently available'
        });
    }

    console.log('[bgchecks.getPdfReport]');

    var id = req.reportCheck.id;

    unirest.get(baseUrl + '/rest/reportCheck/' + id + '/report/pdf')
        .jar(CookieJar)
        .end(function (response) {
            console.log(response.body);

            if (response.error) {
                return res.status(400).send({
                    message: response.error.message,
                    reason: JSON.parse(response.body).reason
                });
            }

            res.set('Content-Type', 'application/pdf');

            res.jsonp(response.body);
        });
}

function checkReportStatus(req, res, next, id) {

    if (!CookieJar) {
        console.log('CookieJar is not Initialized');
        return res.status(400).send({
            message: 'No session currently available'
        });
    }

    unirest.get(baseUrl + '/rest/reportCheck/' + id)
        .jar(CookieJar)
        .end(function (response) {
            console.log(response.body);

            if (response.error) {
                return res.status(400).send({
                    message: response.error.message,
                    reason: JSON.parse(response.body).reason
                });
            }

            var reportCheck = response.body.reportCheckStatus;

            if (reportCheck.status.toUpperCase() === 'COMPLETED') {
                req.reportCheck = response.body;
                next();
            } else {
                res.jsonp(reportCheck);
            }
        });
}
