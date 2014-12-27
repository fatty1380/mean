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
var password = 'Test#123';

var CookieJar;

exports.logout = logout;
exports.getApplicant = getApplicant;
exports.getPdfReport = getPdfReport;
exports.checkReportStatus = checkReportStatus;
exports.runReport = runReport;
exports.getReport = getReport;

function getApplicant(req, res, next, id) {

    unirest.get(baseUrl + '/rest/applicant/' + id)
        .jar(req.cookie)
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

    unirest.delete(baseUrl + '/rest/session')
        .jar(req.cookie)
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
