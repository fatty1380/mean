'use strict';

/**
 * Module dependencies.
 */
var
    _                  = require('lodash'),
    mongoose           = require('mongoose'),
    Bgcheck            = mongoose.model('BackgroundReport'),
    ReportType         = mongoose.model('ReportType'),
    ReportApplicant    = mongoose.model('ReportApplicant'),
    unirest            = require('unirest'),
    Q                  = require('q'),
    moment             = require('moment'),
    contentDisposition = require('content-disposition'),
    path               = require('path'),
    config             = require(path.resolve('./config/config')),
    constants          = require(path.resolve('./modules/core/server/models/outset.constants')),
    log                = require(path.resolve('./config/lib/logger')).child({
        module: 'bgchecks',
        file  : 'everifile.server.service'
    });


/** eVERIFILE Service
 * ----------------------------
 * The eVERIFILE service will make requests to the eVERIFILE API and
 * return a promise that will be fulfilled once completed. These methods
 * should not be used directly by any routes, but instead by the base
 * bgchecks/reports controller to manage flow.
 *
 */

/** SECTION: Public, Bound Members */

exports.GetSession               = GetSession;
exports.SetSKUFilter             = SetSKUFilter;
exports.GetReportTypeDefinitions = GetReportTypeDefinitions;

exports.GetAllApplicants   = GetAllApplicants;
exports.GetApplicant       = GetApplicant;
exports.CreateApplicant    = UpsertApplicant;
exports.SearchForApplicant = searchForApplicant;

exports.RunReport                  = RunReport;
exports.GetReportStatus            = GetReportStatus;
exports.GetReportStatusByApplicant = GetReportStatusByApplicant;
exports.GetPdfReport               = function () {
    throw new Error('Not Implemented');
};
exports.GetSummaryReportPDF        = GetSummaryReportPDF;
exports.GetRawReport               = GetRawReport;


/**
 * SECTION: Private members
 * TODO: Move to config;
 */

var reportPackages    = constants.reportPackages;
var enabledSKUs       = constants.reportPackages.fieldSkus;
var fieldTranslations = {'PKG_PREMIUM': ['NBDS', 'SSNVAL', 'CRIMESC', 'FORM_EVER']};

var server = {
    baseUrl : 'https://renovo-api-test.everifile.com/renovo',
    username: 'api@dswheels.com',
    password: 'Test#123'
};

server = _.extend(server, config.services.everifile);

var Cookie = {
    jar         : null, // CookieJar
    created     : null, // moment
    lastAccessed: null, // moment
    maxAge      : null, // long - milliseconds
    maxKeepalive: 20 * 60 * 1000, // long - milliseconds

    isValid: function () {
        if (this.jar === null) {
            return false;
        }

        var expires;

        if (!!this.maxAge && !!this.created) {
            expires = this.created.add(this.maxAge, 'milliseconds');

            if (moment().isAfter(expires)) {
                log.debug('Cookie has expired');
                this.jar = this.created = this.lastAccessed = null;
                return false;
            }
        }

        if (!!this.maxKeepalive && !!this.lastAccessed) {
            expires = this.lastAccessed.add(this.maxKeepalive, 'milliseconds');

            if (moment().isAfter(expires)) {
                log.debug('Cookie keep alive has expired');
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

        log.debug('[GetSession] with username %j to baseUrl %s', postData.username, server.baseUrl);

        // post login request to get new session;
        unirest.post(server.baseUrl + '/rest/session')
            .type('json')
            .send(postData)
            .jar(newJar)
            .end(function (response) {
                log.debug('[GetSession] Response: %j', response.body);

                if (response.error) {
                    log.debug('[GetSession] Request Errored: %j', response.error);
                    return deferredGetSession.reject(response.error);
                }

                log.debug('[GetSession] Success: %j', newJar);
                Cookie.jar     = newJar;
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

    var defer = Q.defer();

    unirest.get(server.baseUrl + '/rest/report')
        .jar(cookie.jar)
        .end(function (response) {

            if (response.error) {
                log.debug('[GetReportTypeDefinitions] Error in response');
                return defer.reject(response.error);
            }

            var reportTypes = response.body.reports;
            log.debug('[GetReportTypeDefinitions] Got %d report types from server', reportTypes && reportTypes.length);

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
                    return defer.resolve(reports);
                }, function (error) {
                    log.error('Unable to get updated report fields from the server', error);
                    log.debug('Returning updated report types without ', error);
                    return defer.resolve(reportTypes);
                });

        });

    return defer.promise;
}

/** PRIVATE : Report Definitions ---------------------------------------------------- */

function filterBySku(reportTypeData) {
    return enabledSKUs.indexOf(reportTypeData.sku.toUpperCase()) >= 0;
}

function updateReportFields(reportTypes, cookieJar) {
    log.debug('[updateReportFields] updating %d report types', reportTypes.length);

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
    log.debug('Getting Report Fields for SKU "%s"', sku);

    if (!!fieldTranslations[sku]) {
        log.debug('Translating sku %s into %j', sku, fieldTranslations[sku]);

        var componentFields = fieldTranslations[sku].map(function (reportType) {
            return getUpdatedReportFieldsPromise(reportType, cookieJar);
        });

        var defer = Q.defer();

        Q.allSettled(componentFields).then(
            function (processedFields) {
                log.debug('[TranslatedReportFields] Coalescing %d field sources: %j', processedFields);

                var retFields = {};

                var i;
                for (i = 0; i < processedFields.length; i++) {
                    retFields = _.extend(retFields, processedFields[i]);

                    log.debug('[Coalesce_%d] %j', i, retFields);
                }

                defer.resolve(retFields);
            },
            function (error) {
                defer.reject(error);
            }
        );

        return defer.promise;
    }
    else {

        var deferred = Q.defer();

        if (reportType.enabled) {
            unirest
                .get(server.baseUrl + '/rest/report/' + sku + '/fields')
                .jar(cookieJar)
                .end(function (response) {

                    if (response.error) {
                        log.debug('[getUpdatedReportFieldsPromise] Error in response: %j', response.body);

                        return deferred.reject(response.body.reason);
                    }

                    log.debug('[getUpdatedReportFieldsPromise] Got Fields: %j', response.body);

                    reportType.fields = response.body.fields;

                    return deferred.resolve(reportType);
                });
        } else {
            log.debug('Not loading fields for disabled report type: %s', sku);
            return deferred.resolve(reportType);
        }

        return deferred.promise;
    }
}

/** END : Report Definitions ---------------------------------------------------- */


/** SECTION : Remote Applicants ------------------------------------------------- */

function GetAllApplicants(cookie) {
    log.debug('[GetAllApplicants] Requesting all applicants from everifile server');

    var deferred = Q.defer();

    unirest.get(server.baseUrl + '/rest/applicant')
        .jar(cookie.jar)
        .end(function (response) {
            log.debug('[GetAllApplicants] Got response Body: %j', response.body);

            if (response.error) {
                return deferred.reject(response.body.reason);
            }

            log.debug('[GetAllApplicants] Got %d applicants', response.body.applicants && response.body.applicants.length);

            var applicantModels = _.map(response.body.applicants, sanitizeReportApplicant);

            deferred.resolve(applicantModels);
        });

    return deferred.promise;
}

function sanitizeReportApplicant(model) {

    model.remoteId = model.applicantId;

    if (model.hasOwnProperty('governmentId')) {
        log.debug('[initReportApplicantModel] Clearing govId from response object');
        model.governmentId = '';
    }

    if (model.hasOwnProperty('driversLicense')) {
        log.debug('[initReportApplicantModel] Clearing dlId from response object');
        model.driversLicense = '';
    }

    return model;
}

function GetApplicant(cookie, id, noSanitize) {
    log.debug('[GetApplicant] Requesting applicant "%d" from everifile server', id);

    var deferred = Q.defer();
    var endpoint = server.baseUrl + '/rest/applicant/' + (id || '');

    unirest.get(endpoint)
        .jar(cookie.jar)
        .end(function (response) {
            if (response.error) {
                log.error({func: 'GetApplicant', error: response.error},
                    '[%d] Error at endpoint GET `%s`\n\t\tBody: %j', response.error.status, endpoint, response.body);
                return deferred.reject({status: response.error.status, message: response.body.reason});
            }

            log.debug('[GetApplicant] Got response Body for: %j', response.body.firstName + ' ' + response.body.lastName);

            var applicantModel = sanitizeReportApplicant(response.body);

            deferred.resolve(applicantModel);
        });

    return deferred.promise;
}


function UpsertApplicant(cookie, applicantData) {
    log.debug('[UpsertApplicant] %s an applicant', !!applicantData.applicantId ? 'Updating' : 'Creating');

    var deferred = Q.defer();
    debugger;

    var method, trailer;

    if (applicantData.applicantId) {
        method  = 'PUT';
        trailer = '/' + applicantData.applicantId;
    } else {
        method  = 'POST';
        trailer = '';
    }

    var requestBody = applicantData;
    var endpoint    = server.baseUrl + '/rest/applicant' + trailer;

    log.debug('%s %s : %j', method, endpoint, requestBody);

    debugger; // check applicant data. Should we be using applicant.toObject()? merging with the report field def?
    // Ensure that response Body contains Gov ID


    unirest(method, endpoint)
        .headers({'Content-Type': 'application/json'})
        .send(requestBody)
        .jar(cookie.jar)
        .end(function (response) {
            log.debug('[UpsertApplicant] Got response Body: %j', response.body);

            if (response.error) {
                log.debug('[UpsertApplicant] Handling Error Code %d', response.statusCode);
                if (response.statusCode === 406) {
                    log.debug('[UpsertApplicant] Applicant already exists, searching...');

                    searchForApplicant(cookie, requestBody).then(
                        function (success) {
                            log.debug('[UpsertApplicant] Success! found applicantId: %s! ', success.applicantId);
                            deferred.resolve(success);
                        }, function (err) {
                            log.debug('[UpsertApplicant] Applicant search failed');
                            deferred.reject(err);
                        });
                } else {
                    deferred.reject(response.body.reason + '[' + JSON.stringify(response.error) + ']');
                }
            } else {

                response.existingApplicant = method === 'PUT' ? true : false;

                deferred.resolve(response.body);
            }
        });

    return deferred.promise;
}

function searchForApplicant(cookie, applicant) {
    log.debug('[searchForApplicant] Searching for existing applicant from info');

    if (!applicant.governmentId) {
        log.error('Will not search for applicant without govId');
        return Q.reject('Will Not search for applicant without govId');
    }

    var deferred = Q.defer();

    var query  = {
        'firstName'   : applicant.firstName,
        'lastName'    : applicant.lastName,
        'birthDate'   : applicant.birthDate,
        'governmentId': applicant.governmentId
    };
    var method = 'GET';

    log.debug('%s /rest/applicant query:%j', method, query);

    unirest(method, server.baseUrl + '/rest/applicant')
        .headers({'Content-Type': 'application/json'})
        .query(query)
        .jar(cookie.jar)
        .end(function (response) {
            log.debug('[searchForApplicant] Got response Body: %j', !!response.body); // Use truthy to hide sensitive info

            if (response.error) {
                log.debug('[searchForApplicant] Full Error Response: \n\n%j\n\n', response);

                deferred.reject(response.body.reason + '[' + JSON.stringify(response.error) + ']');
            } else if (response.body.applicants && response.body.applicants.length === 1) {
                log.debug('[searchForApplicant] Found a single match!');

                deferred.resolve(response.body.applicants[0]);
            } else if (response.body.applicants) {
                log.error('[searchForApplicant] Found a %d matches - cannot decide on one', response.body.applicants.length);
                deferred.reject('[searchForApplicant] could not decide on a single result from %d matches', response.body.applicants.length);
            } else {
                log.error('[searchForApplicant] Unkown problem: %j', response.body);
                deferred.reject('Unknown issue with search: ' + response.body);
            }
        });

    return deferred.promise;
}
/** SECTION : Remote Applicants ------------------------------------------------- */


/** SECTION: Report Manipulation ------------------------------------------------------------- */

function RunReport(cookie, remoteSku, remoteApplicantId) {

    var reportResponseData = {
        reportSku  : remoteSku,
        applicantId: remoteApplicantId
    };
    log.debug('[RunReport] Executing with parameters: %j', reportResponseData);

    var deferred = Q.defer();

    unirest.post(server.baseUrl + '/rest/report')
        .jar(cookie.jar)
        .query(reportResponseData)
        .end(function (response) {
            log.debug('[RunReport] Response Body: %j', response.body);
            log.debug('[RunReport] Response Error: %j', response.error);

            if (response.error) {
                return deferred.reject(response.body.reason);
            }

            if (response.status === 204) {
                log.error('Bastards didn\'t give us any info! - 204:NO CONTENT');

                return deferred.resolve(reportResponseData);
            }

            var resultId   = parseInt(reportResponseData.applicantId);
            var inherantId = parseInt(response.body.applicant.id);

            if (resultId !== inherantId) {
                var message = 'Mismatched Applicants : Response report is for different applicant than request!';
                log.error('ERROR! %s, request: %d vs response: %d', message, reportResponseData.applicantId, response.body.applicant.id);
                return deferred.reject(new Error(message));
            }

            var sampleResponse = {
                'id'               : 4,
                'applicant'        : {'id': 14},
                'report'           : {'sku': 'G_EDUVRF'},
                'reportCheckStatus': {
                    'timestamp'   : '2014-12-12',
                    'status'      : 'INVOKED',
                    'requiredData': []
                },
                'startDate'        : 1360959827087,
                'completedDate'    : null,
                'resource_key'     : 'lastName',
                'name'             : 'lastName',
                'length'           : 50,
                'type'             : 'string',
                'required'         : true
            };

            var resolution = updateReportStatus(reportResponseData, response.body);
            log.debug('[RunReport] Resolving with data: %j', resolution);

            deferred.resolve(resolution);
        }
    );

    return deferred.promise;
}
function GetReportStatus(cookie, remoteId) {
    log.debug('[GetReportStatus] for remoteId %s', remoteId);

    var deferred = Q.defer();

    unirest.get(server.baseUrl + '/rest/reportCheck/' + remoteId)
        .jar(cookie.jar)
        .end(function (response) {
            log.debug(response.body);

            if (response.error) {
                return deferred.reject(response.body.reason);
            }

            deferred.resolve(response.body);
        });

    return deferred.promise;
}
function GetReportStatusByApplicant(cookie, applicantId) {
    log.debug('[GetReportStatusByApplicant] ');

    var deferred = Q.defer();

    unirest.get(server.baseUrl + '/rest/applicant/' + applicantId + '/reports')
        .jar(cookie.jar)
        .end(function (response) {
            log.debug(response.body);

            if (response.error) {
                return deferred.reject(response.body.reason);
            }

            deferred.resolve(response.body);
        });

    return deferred.promise;
}
function GetSummaryReportPDF(cookie, remoteApplicantId) {

    var deferred = Q.defer();

    var endpoint = server.baseUrl + '/rest/reportSummary/find/' + remoteApplicantId;

    log.debug({func: 'GetSummaryReportPDF', endpoint: endpoint}, 'Connectin to endpoint');
    unirest.get(endpoint)
        .jar(cookie.jar)
        .encoding(null) // Set encoding to NULL in order to return a Buffer rather than string :)
        .end(function (response) {
            if (response.error) {
                log.error({func: 'GetSummaryReportPDF', error: response.error}, 'Error retreiving PDF Report');
                return deferred.reject(response.body.reason || response.error.message);
            }

            log.debug({func: 'GetSummaryReportPDF'}, 'Response headers: %j', response.headers);

            var disposition = contentDisposition.parse(response.headers['content-disposition']);

            log.debug({func: 'GetSummaryReportPDF', disposition: disposition}, 'Parsed Disposition');

            var retval = {
                headers    : response.headers,
                contentType: response.headers['content-type'],
                date       : response.headers.date,
                filename   : disposition.parameters.filename,
                type       : disposition.type,
                content: response.raw_body // jshint ignore:line
            };

            deferred.resolve(retval);
        });

    return deferred.promise;
}
function GetRawReport(cookie, remoteReportId) {
    var deferred = Q.defer();

    unirest.get(server.baseUrl + '/rest/reportCheck/' + remoteReportId + '/report')
        .jar(cookie.jar)
        .end(function (response) {

            if (response.error) {
                log.debug('[GetRawReport] Error Getting Report Data', response.error);
                return deferred.reject(response.body.reason);
            }
            log.trace('[GetRawReport] ', response.body);
            deferred.resolve(response.body);
        });

    return deferred.promise;
}

/** Report Manipulation : Private Methods ------------------------------------------------------------- */

function updateReportStatus(reportStatusResponse, body) {
    if (!reportStatusResponse.remoteId) {
        reportStatusResponse.remoteId  = body.id;
        reportStatusResponse.reportSku = body.report.sku;
    }

    reportStatusResponse.status       = body.reportCheckStatus.status;
    reportStatusResponse.timestamp    = body.reportCheckStatus.timestamp;
    reportStatusResponse.completed    = !!body.completedDate ? moment(body.completedDate) : null;
    reportStatusResponse.requiredData = body.reportCheckStatus.requiredData;

    return reportStatusResponse;
}
/** END: Report Manipulation ------------------------------------------------------------- */

/** SECTION: Private Methods **/


