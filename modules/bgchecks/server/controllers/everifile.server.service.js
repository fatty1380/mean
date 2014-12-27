'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
Bgcheck      = mongoose.model('BackgroundReport'),
ReportType   = mongoose.model('ReportType'),
unirest      = require('unirest'),
Q            = require('q'),
moment       = require('moment'),
_            = require('lodash');


/**
 * SECTION: Private members
 * TODO: Move to config;
 */

var enabledSKUs = ['NBDS', 'PKG_PREMIUM', 'ESCRECUP', 'MVRDOM'];
var baseUrl = 'https://renovo-api-test.everifile.com/renovo';
var username = 'api@dswheels.com';
var password = 'Test#123';

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
            'username': username,
            'password': password
        };

        console.log('[GetSession] with credentials %j to baseUrl %s', postData, baseUrl);

        // post login request to get new session;
        unirest.post(baseUrl + '/rest/session')
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

function SetSKUFilter(filter) {
    enabledSKUs = _.map(filter, function (str) {
        return str.toUpperCase();
    });

    return Q.when(enabledSKUs);
}

function GetReportTypeDefinitions(cookie, filter, enable) {

    var deferredGetReportTypes = Q.defer();

    unirest.get(baseUrl + '/rest/report')
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

function GetAllApplicants(cookie) {
    console.log('[GetAllApplicants] Requesting all applicants from everifile server');

    var deferred = Q.defer();

    unirest.get(baseUrl + '/rest/applicant')
        .jar(cookie)
        .end(function (response) {
            console.log('[GetAllApplicants] Got response Body: %j', response.body);

            if (response.error) {
                deferred.reject(response.body.reason);
            }

            console.log('[GetAllApplicants] Got %d applicants', response.body.applicants && response.body.applicants.length);

            deferred.resolve(response.body.applicants);
        });
}

function GetApplicant(cookie, id) {
    console.log('[GetAllApplicants] Requesting all applicants from everifile server');

    var deferred = Q.defer();

    unirest.get(baseUrl + '/rest/applicant')
        .jar(cookie)
        .end(function (response) {
            console.log('[GetAllApplicants] Got response Body: %j', response.body);

            if (response.error) {
                deferred.reject(response.body.reason);
            }

            console.log('[GetAllApplicants] Got %d applicants', response.body.applicants && response.body.applicants.length);

            deferred.resolve(response.body.applicants);
        });
}


function CreateApplicant(cookie) {
    console.log('[GetAllApplicants] Requesting all applicants from everifile server');

    var deferred = Q.defer();

    unirest.get(baseUrl + '/rest/applicant')
        .jar(cookie)
        .end(function (response) {
            console.log('[GetAllApplicants] Got response Body: %j', response.body);

            if (response.error) {
                deferred.reject(response.body.reason);
            }

            console.log('[GetAllApplicants] Got %d applicants', response.body.applicants && response.body.applicants.length);

            deferred.resolve(response.body.applicants);
        });
}

/** SECTION: Private Methods **/

function filterBySku(reportTypeData) {
    return enabledSKUs.indexOf(reportTypeData.sku.toUpperCase()) >= 0;
}


function updateReportFields(reportTypes, cookie) {
    console.log('[updateReportFields] updating %d report types', reportTypes.length);

    var fields = reportTypes.map(function (reportType) {
        return getUpdatedReportFieldsPromise(reportType, cookie);
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

function getUpdatedReportFieldsPromise(reportType, reqCookie) {

    var sku = reportType.sku;
    console.log('Getting Report Fields for SKU "%s"', sku);

    var deferred = Q.defer();

    if (reportType.enabled) {
        unirest
            .get(baseUrl + '/rest/report/' + sku + '/fields')
            .jar(reqCookie)
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
