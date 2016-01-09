'use strict';

/**
 * Module dependencies.
 */
var
    _ = require('lodash'),
    mongoose = require('mongoose'),
    unirest = require('unirest'),
    Q = require('q'),
    moment = require('moment'),
    contentDisposition = require('content-disposition'),
    path = require('path'),
    config = require(path.resolve('./config/config')),
    constants = require(path.resolve('./modules/core/server/models/outset.constants')),
    parseXML = Q.nfbind(require('xml2js').parseString),
    log = require(path.resolve('./config/lib/logger')).child({
        module: 'luceo',
        file: 'luceo.server.service'
    });

var company = 'coreMark',
    sysConfig = config.services.luceo[company] || {},
    baseUrl = sysConfig.baseUrl,
    username = sysConfig.username,
    password = sysConfig.password,
    auth = { user: username, pass: password };
       
/**
 * Mapping from a user to a candidate (and back)
 * 
 * userField  subField    property    label       type    valueLink
 * firstName              Prop6       First Name  Text    
 * address    zipCode     Prop11      Zip Code    Text
 * address    country     Prop14      Country     Toolbox {type:1}
 */

_.extend(exports, {
    applicant: {
        create: createCandidate,
        remove: _.noop,
        update: updateCandidate,
        list: listCandidates,
        get: getCandidateForUser
    }
});

/**
 * Outset-Side Models
 */
 
/**
 * Example Workflow:
 * -----------------
 * 1. Find or Create Candidate
 * Check for existing candidate ID for the current luceo system
 */

/**
 * @param  {any} user
 * @param  {any} auxProperties
 * 
 * 
 * @returns {Promise} When successful, Resolves with a candidate Object with remoteID,
 *           reference, assignment ID and link
 * @example  
 *     candidate = {
 *        id: 88067,
 *        reference: 088067,
 *        assignmentId: 88126,
 *        link: 'https://ws-core-mark.luceosolutions.com/rest/candidate/88067/'
 *     }
 */
function createCandidate(user, auxProperties) {
    var createCandidateP = Q.defer();
    var candidate = translateUserToCandidate(user);
    
    _.forOwn(auxProperties, function (value, propName) {
        log.warn({ func: 'createCandidate' }, 'Unsure what to do with prop `%s` and val `%s`', propName, value);
    });
    
    var postData = { params: encodeParameters(candidate, true) };
    var url = baseUrl + 'candidate/';
    
    unirest.post(url)
        .send(postData)
        .auth(auth)
        .end(function processCandidateCreateResult(response) {
            if (response.error) {
                log.error({ func: 'processCandidateCreateResult', err: response.error }, 'Request Errored');
                return createCandidateP.reject(response.error);
            }

            parseXML(response.body)
                .then(function xmlParseSuccess(responseObject) {

                    log.debug({ func: 'processCandidateCreateResult', response: responseObject }, 'Processing candidate JS from XML');
                    debugger;

                    var results = responseObject.root;

                    if (!!results.err) {
                        log.error({ func: 'processCandidateCreateResult', err: results.errmsg });
                        return createCandidateP.reject(new Error(results.errmsg));
                    }

                    var newCandidate = results.result;
                    log.info({ func: 'processCandidateCreateResult', candidate: newCandidate });
                    
                    createCandidateP.resolve(newCandidate);

                })
                .catch(function xmlParseError(err) {
                    log.error({ func: 'processCandidateCreateResult', err: err }, 'Request Errored');
                    return createCandidateP.reject(err);
                });
            
            
        });
        
    return createCandidateP.promise;
}
 
function updateCandidate(candidateId, updatedProperties) {
    
    
}
 
function parseCandidateResponse(response, promise) {

    promise = promise || Q.defer();

    return parseXML(response.body)
        .then(function xmlParseSuccess(responseObject) {

            log.debug({ func: 'processCandidateSearchResults', response: responseObject }, 'Processing candidate JS from XML');
            debugger;

            var results = responseObject.root;

            if (!!results.err) {
                log.error({ func: 'processCandidateSearchResults', err: results.errmsg });
                var e = new Error(results.errmsg);
                promise.reject(e);
                throw e;
            }

            var candidate;

            if (!_.isUndefined(results.recordCount)) {
                if (results.recordCount === 0) {
                    promise.reject(null);
                    return null;
                }
                if (results.recordCount > 1) {
                    log.warn({ func: 'processCandidateSearchResults', candidateCount: results.recordCount }, 'Multiple matches found, returning first');
                }

                candidate = _.first(results.result);
            } else {
                candidate = results.result;
            }
            
            candidate = candidate || {};

            log.info({ func: 'processCandidateSearchResults', candidate: candidate });
            
            var secondaryRequestP = Q.defer();
        
            // Resolve this phase with a server call to load the candidate's full info
            unirest.get(candidate.link)
                .auth(auth)
                .end(function processCandidateDetails(candidateDetailsResponse) {
                    secondaryRequestP.resolve(candidateDetailsResponse);
                });
                
            promise.resolve(secondaryRequestP.promise);
            return secondaryRequestP.promise;
        })
        .catch(function xmlParseError(err) {
            log.error({ func: 'processCandidateSearchResults', err: err }, 'Request Errored');
            promise.reject(err);
            throw err;
        });
}

function getCandidateForUser(user) {
    var loadCandidateDetailsP = Q.defer();
    var email = user.email;

    var queryString = encodeParameters({ 'Prop15': email });
    var url = baseUrl + 'candidate/' + queryString;

    unirest.get(url)
        .auth(auth)
        .end(function processCandidateSearchResults(response) {
            if (response.error) {
                log.error({ func: 'processCandidateSearchResults', err: response.error }, 'Request Errored');
                return loadCandidateDetailsP.reject(response.error);
            }

            parseCandidateResponse(response, loadCandidateDetailsP);
        });

    return loadCandidateDetailsP.promise
        .then(function processCandidateDetails(candidateDetailsResponse) {

            if (candidateDetailsResponse.error) {
                log.error({ func: 'processCandidateDetails', err: candidateDetailsResponse.error }, 'Request Errored');
                return loadCandidateDetailsP.reject(candidateDetailsResponse.error);
            }

            parseXML(candidateDetailsResponse.body)
                .then(function xmlParseSuccess(responseObject) {

                    var result = responseObject.root;

                    if (!!result.err) {
                        log.error({ func: 'processCandidateSearchResults', err: result.errmsg });
                        return loadCandidateDetailsP.reject(new Error(result.errmsg));
                    }

                    var candidate = responseObject.root.result;

                    return translateCandidateToUser(candidate);
                })
                .then(function processTranslatedCandidate(candidate) {
                    log.info({ func: 'processTranslatedCandidate', candidate: candidate }, 'Finished processing canddiate from %s server', company);

                });
        });
}

// TODO: Need to restrict query to show only TruckerLine/Outset Candidates by Default
function listCandidates(candidateQuery) { }

/***********************************************************************/

function encodeParameters(query, disableUrlParam) {
    var components = [];

    _.forOwn(query, function (value, key) {
        if (_.isArray(value)) {
            components.push(key + ':' + value.join(','));
        } else {
            components.push(key + ':' + value);
        }
    });

    return (!!disableUrlParam ? '' : '?params=') + components.join(';');
}
/**
 * @param  {any} srcUser
 */
function translateUserToCandidate(srcUser) {
    var candidate = [];
    var promises = _(translation)
        .map(function translateValueToProp(prop) {
        
            var userKey = prop.key;

            if (_.isEmpty(userKey)) {
                return Q.when(null);
            }

            var keys = userKey.split('.') || null;

            var val;

            while (keys.lenth > 0) {
                val = srcUser[keys.shift()];
            }
            
            return getPropForValue(prop, val);
            
    }).reject(_.isEmpty);
    
    return Q.allSettled(promises, function (promiseResults) {
        
        // Iterate over the remote query promises to get the ids which were
        // translated from values and need to be added to the candidate obj
        // before moving on.
        _.each(promiseResults, function (res) {
            if (res.isFulfilled() && !!res.value) {
                candidate.push(res.value);
            }
            else if (res.isFulfilled()) {
                                log.debug({ func: 'translateUserToCandidate' }, 'Ignoring Empty Value');
            } else {
                log.error({ func: 'translateUserToCandidate', err: res.reason }, 'Toolbox Query Failed');
            }
        });
        
        return candidate;
    });
}

function translateCandidateToUser(src) {
    
    var candidate = {};
    
    var promises = [];
    
    _.forOwn(src, function (val, propName) {
        var t = _.find(translation, { ext: propName });

        if (_.isEmpty(t)) {
            return;
        }

        candidate[t.key] = _.extend(t, { value: val });
        
        if (!!t.refUrl && !!val) {
            var d = Q.defer();
            
            unirest.get(baseUrl + t.refUrl)
                .auth(auth)
                .end(function processToolboxLookup(response) {
                    
                    // because we are not wrapped in a promise, we cannot
                    // do a native return - instead we need to use the deferred
                    // object to pass control
                    return parseXML(response.body)
                        .then(function xmlParseSuccess(responseObject) {
                            var result = responseObject.root;
                            if (!!result.err) {
                                log.error({ func: 'processToolboxLookup', err: result.errmsg });
                                return d.reject(new Error(result.errmsg));
                            }

                            candidate[t.key].options = result.result;

                            var lookupVal = _.find(result.result, { id: val });
                            candidate[t.key].rawValue = lookupVal;

                            if (_.isEmpty(lookupVal)) {
                                log.warn({ func: 'processToolboxLookup', val: val, searched: result.result }, 'failed to find value in toolbox');
                                return d.resolve(null);
                            }

                            candidate[t.key].value = lookupVal.lib;

                            return d.resolve(candidate[t.key]);
                        })
                        .catch(function processToolboxErr(err) {
                            log.error({ func: 'processToolboxLookup', err: err }, 'Toolbox Query Failed');
                            return d.reject(err);
                        });
                    
                });
                
            promises.push(d.promise);
        }
    });
    
    return Q.allSettled(promises, function (promiseResults) {
        return candidate;
    });
}

    
    
function getPropForValue(prop, val) {
        var d = Q.defer();
            var retval = {};
            
            // If there is a refURL, we need to translate the 'value' into an 'id'
            if (!!prop.refUrl && !!val) {

                unirest.get(baseUrl + prop.refUrl)
                    .auth(auth)
                    .end(function processToolboxLookup(response) {
                        // because we are not wrapped in a promise, we cannot
                        // do a native return - instead we need to use the deferred
                        // object to pass control
                        return parseXML(response.body)
                            .then(function xmlParseSuccess(responseObject) {
                                var result = responseObject.root;
                                if (!!result.err) {
                                    log.error({ func: 'processToolboxLookup', err: result.errmsg });
                                    return d.reject(new Error(result.errmsg));
                                }
                                
                                // Find the item in the toolbox result based on the 'lib' value (???)
                                var lookupItem = _.find(result.result, { lib: val });

                                if (_.isEmpty(lookupItem)) {
                                    log.warn({ func: 'processToolboxLookup', val: val, searched: result.result }, 'failed to find value in toolbox');
                                    return d.resolve(null);
                                }

                                log.debug({ func: 'processToolboxLookup', val: val, resultId: lookupItem.id }, 'Found ID %s in tooolbox for Value `%s`', lookupItem.id, val);
                                retval[prop.ext] = lookupItem.id;

                                return d.resolve(retval);
                            })
                            .catch(function processToolboxErr(err) {
                                log.error({ func: 'processToolboxLookup', err: err }, 'Toolbox Query Failed');
                                return d.reject(err);
                            });

                    });
            } else {
                retval[prop.ext] = val;

                d.resolve(retval);
            }
            
            return d.promise;
        }
    
    
var translation = [
    { ext: 'Prop0', desc: 'Posting ID', key: '', refUrl: null, type: 'text' },
    { ext: 'Prop6', desc: 'First Name', key: 'firstName', refUrl: null, type: 'text' },
    { ext: 'Prop4', desc: 'Last Name', key: 'lastName', refUrl: null, type: 'text' },
    { ext: 'Prop5', desc: 'Preferred Name', key: 'displayName', refUrl: null, type: 'text' },
    { ext: 'Prop9', desc: 'Address Line 1', key: 'address.line1', refUrl: null, type: 'text' },
    { ext: 'Prop10', desc: 'Address Line 2', key: 'address.line2', refUrl: null, type: 'text' },
    { ext: 'Prop11', desc: 'Zip Code', key: 'address.zipCode', refUrl: null, type: 'text' },
    { ext: 'Prop12', desc: 'City', key: 'address.city', refUrl: null, type: 'text' },
    { ext: 'Prop93', desc: 'State', key: 'address.state', refUrl: 'ref/ref/?params=type:2', type: 'toolbox' },
    { ext: 'Prop14', desc: 'Country', key: 'address.country', refUrl: 'ref/ref/?params=type:1', type: 'toolbox' },
    { ext: 'Prop15', desc: 'Email', key: 'email', refUrl: null, type: 'text' },
    { ext: 'Prop16', desc: 'Home Phone', key: 'phones.home', refUrl: null, type: 'text' },
    { ext: 'Prop17', desc: 'Mobile Phone', key: 'phones.mobile', refUrl: null, type: 'text' },
    { ext: 'Prop22', desc: 'Relevant Work Experience', key: 'experience', refUrl: 'ref/list/?params=type:4', type: 'list' },
    { ext: 'Prop23', desc: 'Education Level', key: 'props.education', refUrl: 'ref/list/?params=type:2', type: 'list' },
    { ext: 'Prop65', desc: 'Langue liste', key: 'props.languages', refUrl: ['ref/language/', 'ref/langlevel/'], type: 'languagelist' },
    { ext: 'Prop66', desc: 'Langue liste', key: 'props.languages', refUrl: ['ref/language/', 'ref/langlevel/'], type: 'languagelist' },
    { ext: 'Prop102', desc: 'Current Work Status', key: '', refUrl: 'ref/list/?params=type:5', type: 'list' },
    { ext: 'Prop103', desc: 'Skills', key: '', refUrl: 'ref/list/?params=type:10', type: 'multiselect' },
    { ext: 'Prop108', desc: 'Division', key: '', refUrl: 'ref/ref/?params=type:5', type: 'toolbox' },
    { ext: 'Prop111', desc: 'Country', key: '', refUrl: 'ref/ref/?params=type:1', type: 'toolbox-multi' },
    { ext: 'Prop112', desc: 'State', key: '', refUrl: 'ref/ref/?params=type:2', type: 'toolbox-multi' },
    { ext: 'Prop113', desc: 'City', key: '', refUrl: 'ref/ref/?params=type:3', type: 'toolbox-multi' },
    { ext: 'Prop114', desc: 'Zip', key: '', refUrl: 'ref/ref/?params=type:4', type: 'toolbox' },
    { ext: 'Prop116', desc: 'Department', key: '', refUrl: 'ref/ref/?params=type:9', type: 'toolbox' },
    { ext: 'Prop118', desc: 'Employment Type', key: '', refUrl: 'ref/list/?params=type:3', type: 'list' },
    { ext: 'Prop121', desc: 'Salary Expectations', key: '', refUrl: null, type: 'text' },
    { ext: 'Prop127', desc: 'What type of driver license do you hold?', key: '', refUrl: 'ref/list/?params=type:19', type: 'list' },
    { ext: 'Prop133', desc: 'Job Desired', key: '', refUrl: null, type: 'text' },
    { ext: 'Prop135', desc: 'Authorized to work in Canada', key: '', refUrl: null, type: 'bool' },
    { ext: 'Prop160', desc: 'Most Recent Employer', key: '', refUrl: null, type: 'text' },
    { ext: 'Prop188', 
        desc: 'I recognize that the above \'Applying to\' questionnaire is not the official application ' +
        'of Core-Mark. I understand that if I am considered for this job I will be required to fill out an ' +
        'official Core-Mark application.', 
        key: '', refUrl: 'ref/list/?params=type:23', type: 'list'
    },
    { ext: 'Prop190', desc: 'Authorized to work in the U.S.', key: '', refUrl: null, type: 'bool' },
    { ext: 'Prop191', desc: 'Comments', key: '', refUrl: null, type: 'text' },
    { ext: 'Prop199', desc: 'Availability', key: '', refUrl: 'ref/list/?params=type:1', type: 'list' },
    { ext: 'Prop224', desc: 'Do you require sponsorship to work in the U.S.?', key: '', refUrl: null, type: 'bool' },
    { ext: 'Prop250', desc: 'Internal Candidate', key: '', refUrl: null, type: 'bool' }
];
    
    
    
    
    
    
    
    
    
    

/** eVERIFILE Service
 * ----------------------------
 * @description The eVERIFILE service will make requests to the eVERIFILE API and
 * return a promise that will be fulfilled once completed. These methods
 * should not be used directly by any routes, but instead by the base
 * bgchecks/reports controller to manage flow.
 *
 */

/** SECTION: Public, Bound Members 
 *  
 */

exports.GetSession = getSession;
exports.SetSKUFilter = setSKUFilter;
exports.GetReportTypeDefinitions = getReportTypeDefinitions;

exports.GetAllApplicants = getAllApplicants;
exports.GetApplicant = getApplicant;
exports.CreateApplicant = upsertApplicant;
exports.SearchForApplicant = searchForApplicant;

exports.RunReport = runReport;
exports.GetReportStatus = getReportStatus;
exports.GetReportStatusByApplicant = getReportStatusByApplicant;
exports.GetPdfReport = function () {
    throw new Error('Not Implemented');
};
exports.GetSummaryReportPDF = getSummaryReportPDF;
exports.GetRawReport = getRawReport;


/**
 * SECTION: Private members
 * TODO: Move to config;
 */

var reportPackages = constants.reportPackages;
var enabledSKUs = constants.reportPackages.fieldSkus;
var fieldTranslations = { 'PKG_PREMIUM': ['NBDS', 'SSNVAL', 'CRIMESC', 'FORM_EVER'] };

var server = {
    baseUrl: 'https://renovo-api-test.everifile.com/renovo',
    username: 'api@dswheels.com',
    password: 'Test#123'
};

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
 */

function getSession() {
    var deferredGetSessionP = Q.defer();

    if (!Cookie.isValid()) {
        log.debug('Invalid or no cookie, logging in');

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
                    return deferredGetSessionP.reject(response.error);
                }

                log.debug('[GetSession] Success: %j', newJar);
                Cookie.jar = newJar;
                Cookie.created = Cookie.lastAccessed = moment();

                return deferredGetSessionP.resolve(Cookie);
            });
    } else {
        log.debug('Cookie is valid, continuing');
        Cookie.lastAccessed = moment();
        deferredGetSessionP.resolve(Cookie);
    }

    return deferredGetSessionP.promise;
}

/** SECTION : Report Definitions ---------------------------------------------------- */

function setSKUFilter(filter) {
    enabledSKUs = _.map(filter, function (str) {
        return str.toUpperCase();
    });

    return Q.when(enabledSKUs);
}

function getReportTypeDefinitions(cookie, filter, enable) {

    var getReportTypeDefsP = Q.defer();

    unirest.get(server.baseUrl + '/rest/report')
        .jar(cookie.jar)
        .end(function (response) {

            if (response.error) {
                log.debug('[GetReportTypeDefinitions] Error in response');
                return getReportTypeDefsP.reject(response.error);
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
                    return getReportTypeDefsP.resolve(reports);
                }, function (error) {
                    log.error('Unable to get updated report fields from the server', error);
                    log.debug('Returning updated report types without ', error);
                    return getReportTypeDefsP.resolve(reportTypes);
                });

        });

    return getReportTypeDefsP.promise;
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

function getAllApplicants(cookie) {
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

    log.debug({ func: 'sanitizeReportApplicant', applicant: model }, 'Pre-sanitized applicant');

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

function getApplicant(cookie, id, noSanitize) {
    log.debug('[GetApplicant] Requesting applicant "%d" from everifile server', id);

    var deferred = Q.defer();
    var endpoint = server.baseUrl + '/rest/applicant/' + (id || '');

    unirest.get(endpoint)
        .jar(cookie.jar)
        .end(function (response) {
            if (response.error) {
                log.error({ func: 'GetApplicant', error: response.error },
                    '[%d] Error at endpoint GET `%s`\n\t\tBody: %j', response.error.status, endpoint, response.body);
                return deferred.reject({ status: response.error.status, message: response.body.reason });
            }

            log.debug('[GetApplicant] Got response Body for: %j', response.body.firstName + ' ' + response.body.lastName);

            var applicantModel = sanitizeReportApplicant(response.body);

            deferred.resolve(applicantModel);
        });

    return deferred.promise;
}


function upsertApplicant(cookie, applicantData) {
    log.debug({ func: 'UpsertApplicant', requestBody: requestBody }, '%s an applicant', !!applicantData.applicantId ? 'Updating' : 'Creating');

    var deferred = Q.defer();

    var method, trailer;

    log.debug({ func: 'UpsertApplicant', applicantData: applicantData }, 'ApplicantData is currently set to');

    if (applicantData.applicantId) {
        method = 'PUT';
        trailer = '/' + applicantData.applicantId;
    } else {
        method = 'POST';
        trailer = '';
    }

    var requestBody = applicantData;
    var endpoint = server.baseUrl + '/rest/applicant' + trailer;

    log.debug({ func: 'UpsertApplicant', requestBody: requestBody }, '%s %s', method, endpoint);

    // check applicant data. Should we be using applicant.toObject()? merging with the report field def?
    // Ensure that response Body contains Gov ID

    unirest(method, endpoint)
        .headers({ 'Content-Type': 'application/json' })
        .send(requestBody)
        .jar(cookie.jar)
        .end(function (response) {
            log.debug({ func: 'UpsertApplicant', response: response.body }, 'Got response Body');

            if (response.error) {
                log.error({ func: 'UpsertApplicant', response: response.error }, 'Got response Error');
                log.debug({ func: 'UpsertApplicant' }, 'Handling Error Code %d', response.statusCode);
                if (response.statusCode === 406) {
                    log.debug({ func: 'UpsertApplicant', requestBody: requestBody }, 'Applicant already exists, searching...');

                    searchForApplicant(cookie, requestBody).then(
                        function (success) {
                            log.debug({ func: 'UpsertApplicant', requestBody: requestBody }, 'Success! found applicantId: %s! ', success.applicantId);
                            deferred.resolve(success);
                        }, function (err) {
                            log.debug({ func: 'UpsertApplicant', requestBody: requestBody }, 'Applicant search failed');
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

    var query = {
        'firstName': applicant.firstName,
        'lastName': applicant.lastName,
        'birthDate': applicant.birthDate,
        'governmentId': applicant.governmentId
    };
    var method = 'GET';

    log.debug('%s /rest/applicant query:%j', method, query);

    unirest(method, server.baseUrl + '/rest/applicant')
        .headers({ 'Content-Type': 'application/json' })
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

function runReport(cookie, remoteSku, remoteApplicantId) {

    var reportResponseData = {
        reportSku: remoteSku,
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

            var resultId = parseInt(reportResponseData.applicantId);
            var inherantId = parseInt(response.body.applicant.id);

            if (resultId !== inherantId) {
                var message = 'Mismatched Applicants : Response report is for different applicant than request!';
                log.error('ERROR! %s, request: %d vs response: %d', message, reportResponseData.applicantId, response.body.applicant.id);
                return deferred.reject(new Error(message));
            }

            var sampleResponse = {
                'id': 4,
                'applicant': { 'id': 14 },
                'report': { 'sku': 'G_EDUVRF' },
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

            var resolution = updateReportStatus(reportResponseData, response.body);
            log.debug('[RunReport] Resolving with data: %j', resolution);

            deferred.resolve(resolution);
        }
            );

    return deferred.promise;
}
function getReportStatus(cookie, remoteId) {
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
function getReportStatusByApplicant(cookie, applicantId) {
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
function getSummaryReportPDF(cookie, remoteApplicantId) {

    var deferred = Q.defer();

    var endpoint = server.baseUrl + '/rest/reportSummary/find/' + remoteApplicantId;

    log.debug({ func: 'GetSummaryReportPDF', endpoint: endpoint }, 'Connectin to endpoint');
    unirest.get(endpoint)
        .jar(cookie.jar)
        .encoding(null) // Set encoding to NULL in order to return a Buffer rather than string :)
        .end(function (response) {
            if (response.error) {
                log.error({ func: 'GetSummaryReportPDF', error: response.error }, 'Error retreiving PDF Report');
                return deferred.reject(response.body.reason || response.error.message);
            }

            log.debug({ func: 'GetSummaryReportPDF' }, 'Response headers: %j', response.headers);

            var disposition = contentDisposition.parse(response.headers['content-disposition']);

            log.debug({ func: 'GetSummaryReportPDF', disposition: disposition }, 'Parsed Disposition');

            var retval = {
                headers: response.headers,
                contentType: response.headers['content-type'],
                date: response.headers.date,
                filename: disposition.parameters.filename,
                type: disposition.type,
                content: response.raw_body // jshint ignore:line
            };

            deferred.resolve(retval);
        });

    return deferred.promise;
}
function getRawReport(cookie, remoteReportId) {
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
        reportStatusResponse.remoteId = body.id;
        reportStatusResponse.reportSku = body.report.sku;
    }

    reportStatusResponse.status = body.reportCheckStatus.status;
    reportStatusResponse.timestamp = body.reportCheckStatus.timestamp;
    reportStatusResponse.completed = !!body.completedDate ? moment(body.completedDate) : null;
    reportStatusResponse.requiredData = body.reportCheckStatus.requiredData;

    return reportStatusResponse;
}
/** END: Report Manipulation ------------------------------------------------------------- */

/** SECTION: Private Methods **/


