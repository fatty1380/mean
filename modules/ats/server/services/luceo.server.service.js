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
    xml2js = require('xml2js'),
    parseXML = Q.nfbind(require('xml2js').parseString),
    log = require(path.resolve('./config/lib/logger')).child({
        module: 'luceo',
        file: 'luceo.server.service'
    });
    
var xmlProcessors = {
    valueProcessors: [xml2js.processors.parseNumbers],
    explicitArray: false
};

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
        findByUser: findCandidateForUser,
        get: getCandidateDetails
    },
    application: {
        create: createApplication,
        find: findApplicationsForUser
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

    return translateUserToCandidate(user)
        .then(function processNewCandidate(candidate) {

            _.forOwn(auxProperties, function (value, propName) {
                log.warn({ func: 'createCandidate' }, 'Unsure what to do with prop `%s` and val `%s`', propName, value);
            });
            
            var candidateId = !!auxProperties && auxProperties.candidateId || null;
            var action = 'Creating new';
            var postData = { params: encodeParameters(candidate, true) };
            var url = baseUrl + 'candidate/';
            
            if (!_.isEmpty(candidateId)) {
                action = 'Updating Existing';
                url = url + candidateId + '/';
            }
                        
            var createCandidateP = Q.defer();

            if (_.isEmpty(candidate)) {
                log.error({ func: createCandidate }, 'Candidate Object is empty ... Aborting Creation');
                createCandidateP.reject(new Error('Failed to create Candidate'));
                return createCandidateP.promise;
            }
            
            log.info({ func: 'createCandidate', postData: postData, candidate: candidate, candidateId: candidateId }, '%s Candidate with the following info...', action);

            unirest.post(url)
                .send(postData)
                .auth(auth)
                .end(function processCandidateCreateResult(response) {
                    if (response.error) {
                        log.error({ func: 'processCandidateCreateResult', err: response.error }, 'Request Errored');
                        return createCandidateP.reject(response.error);
                    }

                    parseXML(response.body, xmlProcessors)
                        .then(function xmlParseSuccess(responseObject) {

                            log.debug({ func: 'processCandidateCreateResult', response: responseObject }, 'Processing candidate JS from XML');
                            
                            var responseRoot = responseObject.root;

                            if (!!responseRoot.err) {
                                log.error({ func: 'processCandidateCreateResult', err: responseRoot.errmsg });
                                return createCandidateP.reject(new Error(responseRoot.errmsg));
                            }

                            var newCandidate = responseRoot.result;
                            log.info({ func: 'processCandidateCreateResult', candidate: newCandidate });

                            createCandidateP.resolve(newCandidate);

                        })
                        .catch(function xmlParseError(err) {
                            log.error({ func: 'processCandidateCreateResult', err: err }, 'Request Errored');
                            return createCandidateP.reject(err);
                        });


                });

            return createCandidateP.promise;
        })
        .then(function updateCandidateProps(candidate) {
            if (!_.isEmpty(user.experience)) {
                
                log.debug({ func: 'updateCandidateProps', experience: user.experience }, 'Updating Candidate\'s Experience');
                            
                return setExperienceForCandidate(candidate.id, user.experience)
                    .then(function handleExperienceResult(expResult) {
                            log.debug({ func: createCandidate.updateCandidateProps, result: expResult }, 'Completed Update candidate Experience');
                    },
                        function handleExperienceSaveErr(err) {
                            log.error({ func: createCandidate.updateCandidateProps, err: err }, 'Updating candidate Experience Failed');
                        })
                    .then(function wrap() {
                        return candidate;
                    });
                            
            }
        })
        .catch(function (err) {

            log.error({ func: 'createCandidate', err: err }, 'Creating new Candidate Failed');
            throw err;
        });
}

function setExperienceForCandidate(candidateId, experienceArray) {
    if (_.isEmpty(candidateId)) {
        return Q(new Error('Candidate ID not Specified'));
    }
    
    var promises = _.map(experienceArray, function saveExperienceToCandidate(experienceItem) {
        var deferred = Q.defer();
        
        var translatedExperience = translateExperienceToEmployment(experienceItem);

        var postData = { params: encodeParameters(translatedExperience, true) };
        var url = baseUrl + 'candidate/' + candidateId + '/employment/';
        
        log.info({ func: 'createCandidate', postData: postData, experience: experienceItem, candidateId: candidateId }, 'Posting Experience for Candidate');
        
        unirest.post(url)
        .send(postData)
        .auth(auth)
        .end(function processExperienceCreateRequest(response) {
            if (response.error) {
                log.error({ func: 'processExperienceCreateRequest', err: response.error }, 'Request Errored');
                return deferred.reject(response.error);
            }

            parseXML(response.body, xmlProcessors)
                .then(function xmlParseSuccess(responseObject) {

                    log.debug({ func: 'processExperienceCreateRequest', response: responseObject }, 'Processing experience JS from XML');
                    
                    var responseRoot = responseObject.root;

                    if (!!responseRoot.err) {
                        log.error({ func: 'processExperienceCreateRequest', err: responseRoot.errmsg });
                        return deferred.reject(new Error(responseRoot.errmsg));
                    }

                    var newExperience = responseRoot.result;
                    log.info({ func: 'processExperienceCreateRequest', candidate: newExperience });

                    deferred.resolve(newExperience);

                })
                .catch(function xmlParseError(err) {
                    log.error({ func: 'processExperienceCreateRequest', err: err }, 'Request Errored');
                    return deferred.reject(err);
                });


        });

        return deferred.promise.then(function updatePromises(savedExperienceObj) {
            // TODO: Save Remote ID of Experience to User's experience;
            
            return savedExperienceObj;
        });
    });
    
    return Q.allSettled(promises)
        .then(function processExperienceUpdates(results) {

            var experienceResults = [];

            _.each(results, function (res) {
                if (res.state === 'fulfilled' && !!res.value) {
                    experienceResults.push(res.value);
                }
            });

            return experienceResults;
        });
    
}

function translateExperienceToEmployment(experience) {
    var employmentObj = {};
    
    _.each(experienceTranslation, function (prop) {
        var key = prop.ext;
        var val = experience[prop.key];

        if (prop.type === 'Date') {
            val = moment(val).format('MM/DD/YYYY');
        }

        employmentObj[key] = val;
    });
    
    return employmentObj;
}

var experienceTranslation = [
    { ext: 'Prop1', desc: 'Start', key: 'startDate', refUrl: null, type: 'Date' },
    { ext: 'Prop2', desc: 'End', key: 'endDate', refUrl: null, type: 'Date' },
    { ext: 'Prop4', desc: 'Company', key: 'company', refUrl: null, type: 'text' },
    { ext: 'Prop5', desc: 'Position', key: 'title', refUrl: null, type: 'text' },
    { ext: 'Prop6', desc: 'Description', key: 'description', refUrl: null, type: 'text' }
];
 
function updateCandidate(candidateId, updatedProperties) {
    
    log.warn({ func: 'updateCandidate' }, 'WARNING: UPDATE CANDIDATE NOT IMPLEMENTED, Returning simple candidate object');
    
    throw new Error('Update Candidate is not yet implemented');
}
 
function findCandidateForUser(user) {
    var loadCandidateDetailsP = Q.defer();
    var email = user.email;

    return listCandidates({ 'Prop15': email })
        .then(function processCandidateList(matchingCandidatesResult) {

            var matchCount = matchingCandidatesResult.recordCount;
            var matches = matchingCandidatesResult.result;

            log.debug({ func: 'getCandidateForUser', matches: matches }, 'Got %d matching candidates for user', matchCount);

            var candidate = _.first(matches);

            return translateCandidateToUser(candidate);
        })
        .catch(function processCandidateSearchError(err) {
            log.error({ func: 'findCandidateForUser', err: err }, 'Failed to find existing Applicant');

            return null;
        });
}

function getCandidateDetails(candidateId) {
    var candidateQueryP = Q.defer();
    var url = baseUrl + 'candidate/' + candidateId;
    
    unirest.get(url)
        .auth(auth)
        .end(function processCandidateDetails(response) {
            if (response.error) {
                log.error({ func: 'getCandidateDetails', err: response.error }, 'Request Errored');
                return candidateQueryP.reject(response.error);
            }
            
            return parseOutResponseData(response.body)
                .then(function processCandidate(candidate) {


                    log.info({ func: 'getCandidateDetails', candidate: candidate }, 'Got raw candidate');

                    return translateCandidateToUser(candidate);
                })
                .then(function finalizeCandidate(translatedCandidate) {

                    log.info({ func: 'getCandidateDetails', candidate: translatedCandidate }, 'Returning translated canddiate');

                    candidateQueryP.resolve(translatedCandidate);
                })
                .catch(function (err) {
                    candidateQueryP.reject(err);
                });
        });

    return candidateQueryP.promise;
}

// TODO: Need to restrict query to show only TruckerLine/Outset Candidates by Default
/**
 * Queries the server and returns a list of canddiates, wrapped in an object
 */
function listCandidates(candidateQuery) { 
    var candidateQueryP = Q.defer();
    
    var query = translateObjectToProps(candidateQuery);
    var paramString = encodeParameters(query);
    var url = baseUrl + 'candidate/' + paramString;
    
     unirest.get(url)
        .auth(auth)
        .end(function processCandidateList(response) {
            if (response.error) {
                log.error({ func: 'processCandidateList', err: response.error }, 'Request Errored');
                return candidateQueryP.reject(response.error);
            }
            
            parseOutResponseData(response.body)
                .then(function processParsedResponse(parsedResponse) {             
                    candidateQueryP.resolve(parsedResponse);
                });
        });

     return candidateQueryP.promise;
}

/***********************************************************************/

var TRUCKERLINE_SOURCE_ID = 1;

function createApplication(candidateId, job) {
    
    var deferred = Q.defer();
    
    var application = {
        applicationtype: 2,
        positionid: job.remoteSystemId,
        //positionreference: ???
        sourceid: TRUCKERLINE_SOURCE_ID,
        //jobadverid: ???,
        //jobadvertreference: ???
    };
    
    var postData = { params: encodeParameters(application, true) };
    var url = baseUrl + 'candidate/' + candidateId + '/application/';
    
    
    log.info({ func: 'createCandidate', postData: postData, candidateId: candidateId, url: url }, 'Creating new Job Application with the following info...');

    
     unirest.post(url)
        .send(postData)
        .auth(auth)
        .end(function processCreatedApplication(response) {
            if (response.error) {
                log.error({ func: 'processCreatedApplication', err: response.error }, 'Request Errored');
                return deferred.reject(response.error);
            }

            parseXML(response.body, xmlProcessors)
                .then(function xmlParseSuccess(responseObject) {

                    log.debug({ func: 'processCreatedApplication', response: responseObject }, 'Processing experience JS from XML');
                    
                    var responseRoot = responseObject.root;

                    if (!!responseRoot.err) {
                        log.error({ func: 'processCreatedApplication', err: responseRoot.errmsg });
                        return deferred.reject(new Error(responseRoot.errmsg));
                    }

                    var newApplication = responseRoot.result;
                    log.info({ func: 'processCreatedApplication', application: newApplication });

                    deferred.resolve(newApplication);

                })
                .catch(function xmlParseError(err) {
                    log.error({ func: 'processCreatedApplication', err: err }, 'Request Errored');
                    return deferred.reject(err);
                });


        });

    return deferred.promise.then(function updatePromises(savedExperienceObj) {
        // TODO: Save Remote ID of Experience to User's experience;
        
        return savedExperienceObj;
    });
}

function findApplicationsForUser(candidateId, positionId) {

    var deferred = Q.defer();
    var queryString = !!positionId ? encodeParameters({positionid: positionId}) : '';
    var url = baseUrl + 'candidate/' + candidateId + '/application/';
    
    unirest.get(url + queryString)
        .auth(auth)
        .end(function processApplicationQuery(response) {
            processUnirestAndParseXML(response)
                .then(function (applicationQueryResult) {
                
                    var count = applicationQueryResult.recordCount;
                    var applications = applicationQueryResult.result;
                    
                    return deferred.resolve(applications);
                })
                .catch(function xmlParseError(err) {
                    log.error({ func: 'processCreatedApplication', err: err }, 'Request Errored');
                    return deferred.reject(err);
                });
        
    });
    
    return deferred.promise;
}


/***********************************************************************/
/*     Private Methods                                                 */
/***********************************************************************/

function processUnirestAndParseXML(response) {
    if (response.error) {
        log.error({ func: 'processUnirestAndParseXML', err: response.error }, 'Request Errored');
        throw new Error(response.error);
    }
    
    return parseOutResponseData(response.body);
}

function encodeParameters(query, disableUrlParam) {
    var components = [];

    _.forOwn(query, function (value, key) {
        if (_.isArray(value)) {
            components.push(key + ':' + value.join(','));
        } else {
            components.push(key + ':' + value);
        }
    });

    if(_.isEmpty(components)) {
        return '';
    }
    
    return (!!disableUrlParam ? '' : '?params=') + components.join(';');
}

function translateObjectToProps(queryObject) {
    var translatedQuery = {};
    
    _.forOwn(queryObject, function (value, key) {
        var prop = _.find(translation, { key: key });

        if (!!prop) {
            translatedQuery[prop.ext] = value;
        }
    });
    
    return translatedQuery;
}



/**
 * @private 
 * @description Given a response body, extracts the return values, whether returned as an
 * array or an objet, depending on the nature of the response.
 */
function parseOutResponseData(responseBody) {
    return parseXML(responseBody, xmlProcessors)
        .then(function xmlParseSuccess(responseObject) {

            log.debug({ func: 'parseOutResponseData', response: responseObject }, 'Processing candidate JS from XML');

            var responseRoot = responseObject.root;

            if (!!responseRoot.err) {
                log.error({ func: 'parseOutResponseData', err: responseRoot.errmsg });
                var e = new Error(responseRoot.errmsg);
                throw e;
            }
            
            // If the response is an 'Array', be sure it is encoded as such;
            if (!_.isUndefined(responseRoot.recordCount)) {
                if (responseRoot.recordCount === 0) {
                    responseRoot.result = [];
                }
                if (responseRoot.recordCount === 1 && !_.isArray(responseRoot.result)) {
                    responseRoot.result = [responseRoot.result];
                }

                log.debug({ func: 'parseOutResponseData', retval: responseRoot }, 'Returning Processed responseRoot');
                return responseRoot;
            }

            log.debug({ func: 'parseOutResponseData', retval: responseRoot.result }, 'Returning Processed Result');
            return responseRoot.result;
        })
        .catch(function xmlParseError(err) {
            log.error({ func: 'parseOutResponseData', err: err }, 'Request Errored');
            throw err;
        });  
}

/**
 * @param  {any} srcUser
 */
function translateUserToCandidate(srcUser) {
    
    log.debug({ func: 'translateUserToCandidate', user: srcUser }, 'START');
    
    var candidate = {};
    var promises = _.map(translation, function translateValueToProp(prop) {

        var userKey = prop.key;

        if (_.isEmpty(userKey)) {
            return Q.when(null);
        }

        var keys = userKey.split('.') || null;
        log.debug({ func: 'translateUserToCandidate', keys: userKey }, 'Keys for Prop');
        
        if (keys.length > 1) {
            log.info({ func: 'translateUserToCandidate', keyCt: keys.length }, 'Processing Compound Key');
        }

        var key = keys.shift();
        var val = srcUser[key];
        log.debug({ func: 'translateUserToCandidate', val: val }, 'User has value for `%s`', key);

        while (keys.length > 0 && _.isObject(val)) {
            key = keys.shift();
            
            var matches = key.match(/(\w+)\[(\d+)\]/);
            if (!_.isEmpty(matches)) {
                key = matches[1];
                var i = matches[2];
                
                val = val[key][i];
            }
            else {
                val = val[key];
            }
            
            log.debug({ func: 'translateUserToCandidate', val: val }, 'Extended...User has value for `%s`', key);
        }
        
        if (_.isEmpty(val)) {
            return Q.when(null);
        }
        
        return getPropForValue(prop, val);
    });
    
    _.reject(promises, _.isEmpty);
    
    log.debug({ func: 'translateUserToCandidate', promises: promises }, 'Waiting for %d promises to settle', promises.length);
    
    
    return Q.allSettled(promises).then(function (promiseResults) {

        log.debug({ func: 'translateUserToCandidate', promises: promiseResults }, 'Processing %d promise results', promiseResults.length);
    
        // Iterate over the remote query promises to get the ids which were
        // translated from values and need to be added to the candidate obj
        // before moving on.
        _.each(promiseResults, function (res) {

            log.debug({ func: 'translateUserToCandidate', promises: res }, 'Processing promise results');

            if (res.state === "fulfilled" && !!res.value) {
                
                var key = res.value.key;
                var value = res.value.value;

                var rawVal = res.value.rawValue && res.value.rawValue.id;

                candidate[key] = rawVal || value;

                log.debug({ func: 'translateUserToCandidate', val: rawVal || value }, 'Set value for `%s`', key);

            }
            else if (res.state === "fulfilled") {
                log.debug({ func: 'translateUserToCandidate' }, 'Ignoring Empty Value');
            } else {
                log.error({ func: 'translateUserToCandidate', err: res.reason }, 'Toolbox Query Failed');
            }
        });

        log.debug({ func: 'translateUserToCandidate', candidate: candidate }, 'Returning Translated Candidate');

        return candidate;
    })
        .catch(function (err) {
            log.error({ func: 'translateUserToCandidate', err: err }, 'Translation Failed ...');
            throw err;
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
        
        if (_.isEmpty(t.key)) {
            log.trace({ func: 'translateCandidateToUser', prop: propName }, 'No key for prop');
            return;
        }
        
        
        log.info({ func: 'translateCandidateToUser', prop: propName, t: t, val: val, }, 'Proc Based on prop');

        candidate[t.key] = val; //_.extend(t, { value: val });
        
        if (!!t.refUrl && !!val) {
            var d = Q.defer();
            
            unirest.get(baseUrl + t.refUrl)
                .auth(auth)
                .end(function processToolboxLookup(response) {
                    
                    // because we are not wrapped in a promise, we cannot
                    // do a native return - instead we need to use the deferred
                    // object to pass control
                    return parseXML(response.body, xmlProcessors)
                        .then(function xmlParseSuccess(responseObject) {
                            var responseRoot = responseObject.root;
                            if (!!responseRoot.err) {
                                log.error({ func: 'translateCandidateToUser.processToolboxLookup', err: responseRoot.errmsg });
                                return d.reject(new Error(responseRoot.errmsg));
                            }
                            
                            var retval = {key : t.key};
                            var searchScope = responseRoot.result.item;

                            retval.options = searchScope;

                            var lookupVal = _.find(searchScope, { id: val });
                            retval.rawValue = lookupVal;

                            if (_.isEmpty(lookupVal)) {
                                log.warn({ func: 'translateCandidateToUser.processToolboxLookup', val: val, searched: searchScope }, 'failed to find value in toolbox');
                                return d.resolve(null);
                            }
                            
                    log.info({ func: 'translateCandidateToUser', prop: propName, src: val, val: lookupVal.lib, }, 'Found Value in Toolbox');

                            retval.value = lookupVal.lib;

                            return d.resolve(retval);
                        })
                        .catch(function processToolboxErr(err) {
                            log.error({ func: 'translateCandidateToUser.processToolboxLookup', err: err }, 'Toolbox Query Failed');
                            return d.reject(err);
                        });
                    
                });
                
            promises.push(d.promise);
        } 
        else {
            log.info({ func: 'translateCandidateToUser', candidate: candidate }, 'Current Candidate State');
        }
    });
    
    
        log.info({ func: 'translateCandidateToUser', candidate: candidate, promises: promises }, 'Waiting on promises');
    
    return Q.allSettled(promises, function (promiseResults) {
        log.info({ func: 'translateCandidateToUser', candidate: candidate, promises: promiseResults }, 'Retukrning final Candidate');
        
        _.each(promiseResults, function (p) {
            if (p.isFulfilled()) {
                var retval = p.value;

                log.info({ func: 'translateCandidateToUser', retval: retval, key: retval.key }, 'Adding promise val to candidate');

                candidate[retval.key] = retval.value;
            }
        });    
            
        return candidate;
    });
}

    
    
function getPropForValue(prop, val) {
    var d = Q.defer();
    var retval = {
        key: null,
        value: null
    };
    
    // If there is a refURL, we need to translate the 'value' into an 'id'
    if (!!prop.refUrl && !!val) {
        log.debug({ func: 'getPropForValue', prop: prop.desc, val: val }, 'Looking up Proop for value');

        unirest.get(baseUrl + prop.refUrl)
            .auth(auth)
            .end(function processToolboxLookup(response) {
                // because we are not wrapped in a promise, we cannot
                // do a native return - instead we need to use the deferred
                // object to pass control
                return parseXML(response.body, xmlProcessors)
                    .then(function xmlParseSuccess(responseObject) {
                        var responseRoot = responseObject.root;
                        if (!!responseRoot.err) {
                            log.error({ func: 'getPropForValue.processToolboxLookup', err: responseRoot.errmsg });
                            return d.reject(new Error(responseRoot.errmsg));
                        }
                        
                        var searchScope = responseRoot.result.item;
                        
                        // Find the item in the toolbox result based on the 'lib' value (???)
                        var lookupItem = _.find(searchScope, { lib: val });

                        if (_.isEmpty(lookupItem)) {
                            log.warn({ func: 'getPropForValue.processToolboxLookup', val: val, searched: searchScope }, 'failed to find value in toolbox');
                            return d.resolve(null);
                        }

                        log.debug({ func: 'getPropForValue.processToolboxLookup', val: val, resultId: lookupItem.id }, 'Found ID %s in tooolbox for Value `%s`', lookupItem.id, val);
                        
                        retval.key = prop.ext;
                        retval.value = lookupItem.id;
                        
                        return d.resolve(retval);
                    })
                    .catch(function processToolboxErr(err) {
                        log.error({ func: 'getPropForValue.processToolboxLookup', err: err }, 'Toolbox Query Failed');
                        return d.reject(err);
                    });

            });
    } else {
        
                        retval.key = prop.ext;
                        retval.value = val;
        
        log.debug({ func: 'getPropForValue', prop: prop.desc, val: val, retval: retval }, 'Returning Simple value for prop');

        d.resolve(retval);
    }
    
    return d.promise;
}
    
    
var translation = [
    { ext: 'Prop0', desc: 'Posting ID', key: '', refUrl: null, type: 'text' },
    { ext: 'Prop6', desc: 'First Name', key: 'firstName', refUrl: null, type: 'text' },
    { ext: 'Prop4', desc: 'Last Name', key: 'lastName', refUrl: null, type: 'text' },
    { ext: 'Prop5', desc: 'Preferred Name', key: 'displayName', refUrl: null, type: 'text' },
    { ext: 'Prop9', desc: 'Address Line 1', key: 'address.streetAddresses[0]', refUrl: null, type: 'text' },
    { ext: 'Prop10', desc: 'Address Line 2', key: 'address.streetAddresses[1]', refUrl: null, type: 'text' },
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
    
    
    
    
    
    
    