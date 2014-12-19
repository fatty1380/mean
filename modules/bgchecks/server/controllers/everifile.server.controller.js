'use strict';

/**
 * Module dependencies.
 */
var mongoose     = require('mongoose'),
    Bgcheck      = mongoose.model('Bgcheck'),
    unirest      = require('unirest'),
    _            = require('lodash');

// Config
var baseUrl = 'https://renovo-api-test.everifile.com/renovo';
var username = 'api@dswheels.com';
var password = 'Test#123';

var CookieJar;

exports.login = login;
exports.logout = logout;
exports.hasSession = hasSession;
exports.getApplicants = getApplicants;
exports.getApplicant = getApplicant;
exports.getPdfReport = getPdfReport;
exports.checkReportStatus = checkReportStatus;
exports.getAvailableReports = getAvailableReports;
exports.runReport = runReport;
exports.getReport = getReport;

function login(req, res) {

    if (!!CookieJar) {
        console.log('CookieJar already Initialized');
        return res.status(200).send({
            message: 'Session already initialized'
        });
    }

    // Initaalize new Cookie Jar
    CookieJar = unirest.jar(true);

    // Init username/password post data
    var postData = {
        'username': username,
        'password': password
    };

    // post login request to get new session;
    unirest.post(baseUrl + '/rest/session')
        .type('json')
        .send(postData)
        .jar(CookieJar)
        .end(function (response) {
            console.log(response.body);

            if (response.error) {
                CookieJar = null;

                return res.status(400).send({
                    message: response.error.message,
                    reason: response.body ? JSON.parse(response.body).reason : response.error.code
                });
            }

            res.jsonp(response.body);
        });
}

function hasSession(req, res, next) {
    if (!CookieJar) {
        console.log('CookieJar is not Initialized');
        return res.status(400).send({
            message: 'No session currently available'
        });
    }

    next();
}

function ensureSession(req, res, next) {
    if(!CookieJar) {
        login(req, res);
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

function getAvailableReports(req, res) {

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

            res.jsonp(response.body);
        });
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
