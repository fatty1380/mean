'use strict';

/**
 * Module dependencies.
 */
var mongoose    = require('mongoose'),
Bgcheck         = mongoose.model('BackgroundReport'),
ReportType      = mongoose.model('ReportType'),
ReportApplicant = mongoose.model('ReportApplicant'),
unirest         = require('unirest'),
Q               = require('q'),
moment            = require('moment'),
path            = require('path'),
config          = require(path.resolve('./config/config')),
_               = require('lodash');


/** eVERIFILE Service
 * ----------------------------
 * The eVERIFILE service will make requests to the eVERIFILE API and
 * return a promise that will be fulfilled once completed. These methods
 * should not be used directly by any routes, but instead by the base
 * bgchecks/reports controller to manage flow.
 *
 */

/** SECTION: Public, Bound Members */

exports.GetSession = GetSession;
exports.SetSKUFilter = SetSKUFilter;
exports.GetReportTypeDefinitions = GetReportTypeDefinitions;

exports.GetAllApplicants = GetAllApplicants;
exports.GetApplicant = GetApplicant;
exports.CreateApplicant = CreateApplicant;

exports.RunReport = RunReport;
exports.GetReportStatus = GetReportStatus;
exports.GetReportStatusByApplicant = GetReportStatusByApplicant;
exports.GetPdfReport = function () {
    throw new Error('Not Implemented');
};
exports.GetSummaryReportPDF = GetSummaryReportPDF;
exports.GetRawReport = GetRawReport;


/**
 * SECTION: Private members
 * TODO: Move to config;
 */

var enabledSKUs = ['NBDS', 'PKG_PREMIUM', 'ES_ECUPIT', 'MVRDOM'];

var server = {
    baseUrl: 'https://renovo-api-test.everifile.com/renovo',
    username: 'api@dswheels.com',
    password: 'Test#123'
};

debugger;
server = _.extend(server, config.services.everifile);

var Cookie = {
    jar: null, // CookieJar
    created: null, // moment
    lastAccessed: null, // moment
    maxAge: null, // long - milliseconds
    maxKeepalive: 20 * 60 * 1000, // long - milliseconds

    isValid: function () {
        if (this.jar === null) {
            return false;
        }

        var expires;

        if (!!this.maxAge && !!this.created) {
            expires = this.created.add(this.maxAge, 'milliseconds');

            if (moment().isAfter(expires)) {
                console.log('Cookie has expired');
                this.jar = this.created = this.lastAccessed = null;
                return false;
            }
        }

        if (!!this.maxKeepalive && !!this.lastAccessed) {
            expires = this.lastAccessed.add(this.maxKeepalive, 'milliseconds');

            if (moment().isAfter(expires)) {
                console.log('Cookie keep alive has expired');
                this.jar = this.created = this.lastAccessed = null;
                return false;
            }
        }

        return true;
    }
};

/**
 * GetSession : Returns a promise containing a session cookie to use in subsequent requests
 * @returns {Promise.promise|Cookie}
 * @constructor
 */

function GetSession() {
    var deferredGetSession = Q.defer();

    if (!Cookie.isValid()) {

        // Initalize new Cookie Jar
        var newJar = unirest.jar(true);

        var postData = {
            'username': server.username,
            'password': server.password
        };

        console.log('[GetSession] with credentials %j to baseUrl %s', postData, server.baseUrl);

        // post login request to get new session;
        unirest.post(server.baseUrl + '/rest/session')
            .type('json')
            .send(postData)
            .jar(newJar)
            .end(function (response) {
                console.log('[GetSession] Response: %j', response.body);

                if (response.error) {
                    console.log('[GetSession] Request Errored: %j', response.error);
                    return deferredGetSession.reject(response.error);
                }

                console.log('[GetSession] Success: %j', newJar);
                Cookie.jar = newJar;
                Cookie.created = Cookie.lastAccessed = moment();

                return deferredGetSession.resolve(Cookie);
            });
    } else {
        Cookie.lastAccessed = moment();
        deferredGetSession.resolve(Cookie);
    }

    return deferredGetSession.promise;
}

/** SECTION : Report Definitions ---------------------------------------------------- */

function SetSKUFilter(filter) {
    enabledSKUs = _.map(filter, function (str) {
        return str.toUpperCase();
    });

    return Q.when(enabledSKUs);
}

function GetReportTypeDefinitions(cookie, filter, enable) {

    var deferredGetReportTypes = Q.defer();

    unirest.get(server.baseUrl + '/rest/report')
        .jar(cookie.jar)
        .end(function (response) {

            if (response.error) {
                console.log('[GetReportTypeDefinitions] Error in response');
                return deferredGetReportTypes.reject(response.error);
            }

            var reportTypes = response.body.reports;
            console.log('[GetReportTypeDefinitions] Got %d report types from server', reportTypes && reportTypes.length);

            if (!!enabledSKUs) {
                if (filter) {
                    reportTypes = reportTypes.filter(filterBySku);
                }

                if (enable) {
                    // Set the reports to 'enabled'
                    _.map(reportTypes, function (rt) {
                        if (filterBySku(rt)) {
                            rt.enabled = true;
                        }
                    });
                }
            }

            updateReportFields(reportTypes, cookie.jar)
                .then(function (reports) {
                    return deferredGetReportTypes.resolve(reports);
                }, function (error) {
                    console.error('Unable to get updated report fields from the server', error);
                    console.log('Returning updated report types without ', error);
                    return deferredGetReportTypes.resolve(reportTypes);
                });

        });

    return deferredGetReportTypes.promise;
}

/** PRIVATE : Report Definitions ---------------------------------------------------- */

function filterBySku(reportTypeData) {
    return enabledSKUs.indexOf(reportTypeData.sku.toUpperCase()) >= 0;
}

function updateReportFields(reportTypes, cookieJar) {
    console.log('[updateReportFields] updating %d report types', reportTypes.length);

    var fields = reportTypes.map(function (reportType) {
        return getUpdatedReportFieldsPromise(reportType, cookieJar);
    });

    var defer = Q.defer();

    Q.allSettled(fields).then(
        function (processedFields) {
            defer.resolve(processedFields);
        },
        function (error) {
            defer.reject(error);
        }
    );

    return defer.promise;
}

function getUpdatedReportFieldsPromise(reportType, cookieJar) {

    var sku = reportType.sku;
    console.log('Getting Report Fields for SKU "%s"', sku);

    var deferred = Q.defer();

    if (reportType.enabled) {
        unirest
            .get(server.baseUrl + '/rest/report/' + sku + '/fields')
            .jar(cookieJar)
            .end(function (response) {

                if (response.error) {
                    console.log('[getUpdatedReportFieldsPromise] Error in response: %j', response.body);

                    return deferred.reject(response.body.reason);
                }

                console.log('[getUpdatedReportFieldsPromise] Got Fields: %j', response.body);

                reportType.fields = response.body.fields;

                return deferred.resolve(reportType);
            });
    } else {
        console.log('Not loading fields for disabled report type: %s', sku);
        return deferred.resolve(reportType);
    }

    return deferred.promise;
}

/** END : Report Definitions ---------------------------------------------------- */


/** SECTION : Remote Applicants ------------------------------------------------- */

function GetAllApplicants(cookie) {
    console.log('[GetAllApplicants] Requesting all applicants from everifile server');

    var deferred = Q.defer();

    unirest.get(server.baseUrl + '/rest/applicant')
        .jar(cookie.jar)
        .end(function (response) {
            console.log('[GetAllApplicants] Got response Body: %j', response.body);

            if (response.error) {
                deferred.reject(response.body.reason);
            }

            console.log('[GetAllApplicants] Got %d applicants', response.body.applicants && response.body.applicants.length);

            var applicantModels = _.map(response.body.applicants, sanitizeReportApplicant);

            deferred.resolve(applicantModels);
        });

    return deferred.promise;
}

function sanitizeReportApplicant(model) {

    model.remoteId = model.applicantId;

    if(model.hasOwnProperty('governmentId')) {
        console.log('[initReportApplicantModel] Clearing govId from response object');
        model.governmentId = null;
    }

    if(model.hasOwnProperty('driversLicense')) {
        console.log('[initReportApplicantModel] Clearing dlId from response object');
        model.driversLicense = null;
    }

    return model;
}

function GetApplicant(cookie, id) {
    console.log('[GetApplicant] Requesting applicant "%d" from everifile server', id);

    var deferred = Q.defer();

    unirest.get(server.baseUrl + '/rest/applicant/' + id)
        .jar(cookie.jar)
        .end(function (response) {
            console.log('[GetApplicant] Got response Body for: %j', response.body.firstName + ' ' + response.body.lastName);

            if (response.error) {
                deferred.reject(response.body.reason);
            }

            var applicantModel = sanitizeReportApplicant(response.body);

            deferred.resolve(applicantModel);
        });

    return deferred.promise;
}


function CreateApplicant(cookie, applicant) {
    console.log('[CreateApplicant] Creating a new applicant');

    var deferred = Q.defer();
    debugger;

    var method;

    if(applicant.remoteId) {
        method = 'PUT';
    } else {
        method = 'POST';
    }

    unirest(method,server.baseUrl + '/rest/applicant')
        .headers({'Content-Type': 'application/json'})
        .send(applicant)
        .jar(cookie.jar)
        .end(function (response) {
            console.log('[CreateApplicant] Got response Body: %j', response.body);

            if (response.error) {
                console.log('[CreateApplicant] Full Error Response: \n\n%j\n\n', response);

                deferred.reject(response.body.reason + '[' +JSON.stringify(response.error) + ']');
            }

            deferred.resolve(response.body);
        });

    return deferred.promise;
}
/** SECTION : Remote Applicants ------------------------------------------------- */


/** SECTION: Report Manipulation ------------------------------------------------------------- */

function RunReport(cookie, bgReport) {
    console.log('[CreateApplicant] ');

    var deferred = Q.defer();

    unirest.post(server.baseUrl + '/rest/report')
        .jar(cookie.jar)
        .query({
            reportSku: bgReport.type.sku,
            remoteApplicantId: bgReport.remoteApplicantId
        })
        .end(function (response) {
            console.log(response.body);
            console.log(response.error);

            if (response.error) {
                deferred.reject(response.body.reason);
            }

            if (bgReport.remoteApplicantId !== response.body.applicant.id) {
                var message = 'Mismatched Applicants : Response report is for different applicant than request!';
                console.error('ERROR! %s, request: %d vs response: %d', message, bgReport.remoteApplicantId, response.body.applicant.id);
                deferred.reject(new Error(message));
            }

            var sampleResponse = {
                'id': 4,
                'applicant': {'id': 14},
                'report': {'sku': 'G_EDUVRF'},
                'reportCheckStatus': {
                    'timestamp': '2014-12-12',
                    'status': 'INVOKED',
                    'requiredData': []
                },
                'startDate': 1360959827087,
                'completedDate': null,
                'resource_key': 'lastName',
                'name': 'lastName',
                'length': 50,
                'type': 'string',
                'required': true
            };


            updateReportStatus(bgReport, response.body).then(function (success) {
                deferred.resolve(success);
            });
        }
    );

    return deferred.promise;
}
function GetReportStatus(cookie, remoteId) {
    console.log('[CreateApplicant] ');

    var deferred = Q.defer();

    unirest.get(server.baseUrl + '/rest/reportCheck/' + remoteId)
        .jar(cookie.jar)
        .end(function (response) {
            console.log(response.body);

            if (response.error) {
                deferred.reject(response.body.reason);
            }

            var reportCheck = response.body.reportCheckStatus;

            deferred.resolve(response.body);
        });

    return deferred.promise;
}
function GetReportStatusByApplicant(cookie, applicantId) {
    console.log('[CreateApplicant] ');

    var deferred = Q.defer();

    unirest.get(server.baseUrl + '/rest/applicant/' + applicantId + '/reports')
        .jar(cookie.jar)
        .end(function (response) {
            console.log(response.body);

            if (response.error) {
                deferred.reject(response.body.reason);
            }

            var reportCheck = response.body.reportCheckStatus;


            deferred.resolve(response.body);
        });

    return deferred.promise;
}
function GetSummaryReportPDF(cookie, bgReport) {
    console.log('[GetSummaryReportPDF] ');

    var deferred = Q.defer();

    unirest.get(server.baseUrl + '/rest/reportSummary/find/' + bgReport.remoteApplicantId + '/report/pdf')
        .jar(cookie.jar)
        .end(function (response) {
            debugger;

            if (response.error) {
                deferred.reject(response.body.reason);
            }

            deferred.resolve(response.body);
        });

    return deferred.promise;
}
function GetRawReport(cookie, bgReport) {
    console.log('[GetRawReport] ');

    var deferred = Q.defer();

    unirest.get(server.baseUrl + '/rest/reportCheck/' + bgReport.remoteId + '/report')
        .jar(cookie.jar)
        .end(function (response) {
            console.log(response.body);

            if (response.error) {
                deferred.reject(response.body.reason);
            }

            deferred.resolve(response.body);
        });

    return deferred.promise;
}

/** Report Manipulation : Private Methods ------------------------------------------------------------- */

function updateReportStatus(bgReport, body) {
    if (!bgReport.remoteId) {
        bgReport.remoteId = body.id;
        bgReport.reportSku = body.report.sku;
    }

    bgReport.status = body.reportCheckStatus.status;
    bgReport.updateStatusChecks.push(body.reportCheckStatus);
    bgReport.completed = !!body.completedDate ? moment(body.completedDate) : null;
    bgReport.requiredData = body.reportCheckStatus.requiredData;
}
/** END: Report Manipulation ------------------------------------------------------------- */

/** SECTION: Private Methods **/


