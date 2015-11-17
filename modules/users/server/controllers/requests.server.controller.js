'use strict';

/** Exported Request Operations */
exports.listRequests = listRequests;
exports.getRequest = getRequest;
exports.createRequest = createRequest;
exports.updateRequest = updateRequest;
exports.loadRequest = loadRequest;
exports.closeRequestChain = closeRequestChain;

/** Middleware */
exports.requestById = requestById;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    path = require('path'),
    Q = require('q'),
    shortid = require('shortid'),
    NotificationCtr = require(path.resolve('./modules/emailer/server/controllers/notifications.server.controller')),
    log = require(path.resolve('./config/lib/logger')).child({
        module: 'users',
        file: 'Authorization.Controller'
    });

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    RequestMessage = mongoose.model('RequestMessage'),
    BranchData = mongoose.model('BranchData'),
    Login = mongoose.model('Login');

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Adds a new UserId to the requesting Profile's [FRIENDS]
 * @param req
 * @param res
 * @param next
 */

function createRequest(req, res, next) {
    
    // TODO: Check for existing requests, both sender and recipient (?);
	
    // If the 'Profile' property is set on the request, this means another user is being
    // 'modified'. Only Allow the request to continue if the user is an admin. 
    if (!!req.profile && !req.user.isAdmin) {
        return res.status(403).send({ message: 'Cannot edit/modify requests for other users' });
    }
    
    // Setup variables for search
    if (!req.user.isAdmin && (!_.isEmpty(req.profile) && !req.profile.id.equals(req.user.id))) {
        req.log.error({ func: 'createRequest' }, 'Cannot make requests for other users if not admin');
        return res.status(401).send({ message: 'Sorry, but you cannot Create Requests for other users' });
    }

    var me = !!req.profile ? req.profile.id : req.user.id;

    req.log.debug({ func: 'createRequest', body: req.body, friend: req.body.to }, 'Creating Request with POSTed body content');

    // All request types must have recipient info, with the exception of a 'reportRequest' which is sent to the user.
    if (req.body.requestType !== 'reportRequest' && _.isEmpty(req.body.to) && _.isEmpty(req.body.contactInfo)) {
        req.log.error({ func: 'createRequest' }, 'No Recipient Parameter present in request');
        return res.status(400).send({ message: 'No Recipient Specified in Request' });
    }

    var request = new RequestMessage(normalizeRequest(req.body));
    request.from = req.user;

    return request.save()
        .then(function (savedRequest) {
            req.log.debug({ func: 'createRequest', request: savedRequest });

            var result = NotificationCtr.processRequest(savedRequest, req.user);
            if (result.success) {
                req.log.debug({ func: 'createRequest', result: result }, 'Successfully sent notification');
            }
            else {
                req.log.error({ func: 'createRequest', result: result }, 'Failed to send notification');
            }

            req.log.debug({ func: 'createRequest', response: savedRequest }, 'Returning newly Created Request Object');
            req.request = savedRequest;

            return res.json(savedRequest);
        }, function caught(error) {
            req.log.error({ func: 'createRequest', err: error }, 'Failed to save new Request');
            return next(error);
        });
}

/**
 * listRequests
 * Based on query parameters, finds and returns Request Messages to the user.
 * 
 * @query status array or single value from 'new', 'accepted', 'rejected'
 * @query requestType array or single value from 'friendRequest', 'shareRequest', 'reviewRequest'. Defaults to 'friendRequest'
 * @query userId used to specifiy a request from or to a specific user.
 * 
 * @returns res.json(requests) 
 */
function listRequests(req, res) {
    req.log.trace({ func: 'listRequests' }, 'Start');

    if (!req.isAuthenticated()) {
        return res.json([]);
    }

    var types,
        mainQuery = { 'to': req.user.id },
        statuses = req.query.status === 'all' ? ['new', 'accepted'] : req.query.status || ['new', 'sent'];

    mainQuery.status = statuses.length > 1 ? { $in: statuses } : statuses[0];

    if (req.query.requestType !== 'all') {
        types = req.query.requestType || ['friendRequest'];

        mainQuery.requestType = types.length > 1 ? { $in: types } : types[0];
    }

    var orQuery = [];


    if (!!req.query && !!req.query.userId) {
        orQuery.push({ to: req.user.id, from: req.query.userId });
        orQuery.push({ from: req.user.id, to: req.query.userId });
    } else {
        orQuery.push({ to: req.user.id });
        orQuery.push({ from: req.user.id });
    }

    req.log.trace({ func: 'listRequests', query: req.query, statuses: statuses, types: types, mainQuery: mainQuery, orQuery: orQuery }, 'Executing find');

    return RequestMessage.find(mainQuery)
        .or(orQuery)
        .sort('created')
        .exec()
        .then(
            function (requests) {
                if (!requests) {
                    requests = [];
                }
                req.log.debug({ func: 'listRequests' }, 'Found %d Requests', requests.length);

                req.log.trace({ func: 'listRequests', requests: requests }, 'Found Requests based on query');
                return res.json(requests);
            })
        .catch(
            function (err) {
                req.log.error({ func: 'listRequests', error: err }, 'Unable to find requests due to error');

            });


}

/**
 * getRequest
 * Simple 'read' method which returns the value loaded into the request value
 */
function getRequest(req, res, next) {
    return res.json(req.request);
}

function updateRequest(req, res, next) {
    if (_.isEmpty(req.request) || req.request.requestType === 'friendRequest') {
        return next();
    }
}

function closeRequestChain(req, res, next) {
    if (!res.headersSent) {
        return next(new Error('Unknown Request Type'));
    }
}


/**
 * requestById
 * Loads a request by its ID, used as middleware for "RUD" operations on Requests.
 * 
 * @param id ID Representing the Request being loaded
 * 
 */
function requestById(req, res, next, id) {

    RequestMessage.findById(id)
        .exec().then(
            function (request) {
                if (_.isEmpty(request)) {
                    req.log.debug({ func: 'requestById' }, 'No Valid request found');
                    return res.status(404).send('No request found');
                }

                req.log.debug({ func: 'requestById', request: request }, 'Found request between %s and %s with status %s', request.from, request.to, request.status);
                req.request = request;

                next();
            }, function (err) {
                req.log.error({ func: 'requestById', error: err }, 'Unable to find request due to error');
                next(err);
            });
}

///////////////////////////////////////////////////////////////////////////////////////

/**
 * updateOutstandingRequests
 * -------------------------
 * When a new user signs up, or updates their info, we need to look into the outstanding
 * (new/sent) requests to see which ones now have an associated user, and not just a hanging
 * bit of contact info.
 */

exports.updateOutstandingRequests = updateOutstandingRequests;

NotificationCtr.events.on('branch:new', updateOutstandingRequests);

function updateOutstandingRequests(user, branchData) {

    if (!user) {
        return Q.reject('User not Specified');
    }

    log.info({ func: 'updateOutstandingRequests', file: 'users.connections', branchData: branchData, user: user }, 'Processing BranchData from New User Request');

    return (_.isEmpty(branchData) ? BranchData.findOne({ user: user._id }).exec() : Q.resolve(branchData))
        .then(function success(bd) {
            if (_.isEmpty(bd)) {
                return Q.reject('No Branch Data Found');
            }

            branchData = bd;
            return getMatchingRequests(user, branchData);
        })
        .then(
            function success(outstandingRequests) {
                if (_.isEmpty(outstandingRequests)) {
                    log.info({ func: 'updateOutstandingRequests' }, 'No Outstanding Requests Found');
                    return null;
                }

                log.info({ func: 'updateOutstandingRequests' }, 'Mapping %d Found Requests', outstandingRequests.length);
                return Q.all(_.map(outstandingRequests, function (request) {
                    request.to = user._id;

                    log.info({ func: 'updateOutstandingRequests', updated: request }, 'Saving Updated Request');

                    return request.save();
                }));

            })
        .then(
            function success(saved) {

                branchData.status = 'processed';
                branchData.save();

                if (!!saved) {
                    log.info({ func: 'updateOutstandingRequests', firstSaved: _.first(saved) }, 'Updated %d outstanding Requests', saved.length);
                } else {
                    log.warn({ func: 'updateOutstandingRequests' }, 'No Requests - what happened?');

                    branchData.status = 'notFound';
                    branchData.save();

                    return [];
                }

                return saved;
            })
        .catch(
            function fail(err) {
                log.error({ func: 'updateOutstandingRequests', err: err }, 'Failed to query or find outstanding requests');


                branchData.status = 'rejected';
                branchData.save();

                return null;
            });
}

/**
 * finding 'matching' requests:
 * 
 * 1. lookup branch data for user. EG:
 *     "requestId"      : "5646f055b9203e0a07f8dd34",   # ID of the request
 *     "shortId"        : "NJ8O1yeXe",                  # ShortId, also from the request
 *     "requestUserId"  : "56450f83b9203e0a07f8c608",   # The userId who sent the request
 */

function getMatchingRequests(user, bd) {

    if (!bd) {
        return Q.reject('No BD Found');
    }

    log.debug({ func: 'getMatchingRequests', branchData: bd }, 'Found Branch Data For User');

    var query = {
        to: null,
        status: { $in: ['new', 'sent'] },
        requestType: 'friendRequest'
    };

    var findMessage = RequestMessage
        .find(query);


    log.debug({ func: 'getMatchingRequests', query: query }, 'Created Query');
    
    // Setup the possible query matches and conditions
    var ors = [];

    if (!!bd) {
        if (!!bd.data.shortId) {
            ors.push({ shortId: bd.data.shortId });
        }
        if (!!bd.data.requestId) {
            ors.push({ _id: mongoose.Types.ObjectId(bd.data.requestId) });
        }
    } else {
        log.warn({ func: 'getMatchingRequests' }, 'No Branch Data Found');
    }

    if (_.isEmpty(ors)) {
        log.error({ func: 'getMatchingRequests' }, 'No Query Data Available - Rejecting');
        return Q.reject('No Query Data Available');
    }

    log.warn({ func: 'getMatchingRequests', ors: ors }, 'Searching requests based on %d ors', ors.length);
        
    // Return the executed query
    return findMessage.or(ors).exec()
        .then(
            function success(requests) {
                log.debug({ func: 'getMatchingRequests', requests: requests }, 'Found Matching, Outstanding Requests');

                return requests;
            });
            
            
    // TODO: Incorporate this logic for extended search
    // 
    // var emails = _.reject([validateEmail(user.email)], _.isEmpty);
    // var phones = _.reject([deformatPhone(user.phone)], _.isEmpty);
    // if (!_.isEmpty(emails)) {
    //     ors.push({ $in: emails });
    // }

    // if (!_.isEmpty(phones)) {
    //     ors.push({ $in: phones });
    // }
    // if (!_.isEmpty(rm.contactInfo.email) && !_.contains(emails, rm.contactInfo.email)) {
    //     emails.push(rm.contactInfo.email);
    // }
    // if (!_.isEmpty(rm.contactInfo.phone) && !_.contains(phones, rm.contactInfo.phone)) {
    //     phones.push(rm.contactInfo.phone);
    // }



    // return _.filter(requests, function (request) {
    //     var ci = request.contactInfo;

    //     if (!_.isEmpty(ci.email)) {
    //         if (ci.email === email) {
    //             return true;
    //         }

    //         if (_.any(ci.emails, function (e) { return e.value === email; })) {
    //             return true;
    //         }
    //     }

    //     if (!_.isEmpty(ci.phone)) {
    //         if (ci.phone === phone) {
    //             return true;
    //         }

    //         if (_.any(ci.phoneNumbers, function (e) { return e.value === phone; })) {
    //             return true;
    //         }
    //     }
    // }
}

/**
 * normalizeContactInfo
 * --------------------
 * Looks at existing Request Messages and normalizes the value in the 'contactInfo' field;
 * 
 * Formatting & Fields
 * - displayName : "Robert Cram"
 * - checked : true
 * - phoneNumbers [ "425-391-5362", "206-949-3474" ]
 * - emails : "racingmedic75@yahoo.com"
 * - emails : "
 * 
 * From Contacts:
 * - phone : "{{string}}"
 * - email : "{{string}}"
 * - displayName : "{{string}}",
 * - lastName : "{{string}}",
 * - firstName : "{{string}}",
 * - phoneNumbers : [{ type: 'work', value: '650-776-7675', pref: "{{bool}}", id: "{{string}}"}]
 * - emails : [{ type: 'work', value: 'sbaker@test.com', pref: "{{bool}}", id: "{{string}}"}]
 * - emails : [{ value : "undefined"}]
 * 
 * 1. Eliminate Duplicates
 * 2. Remove formatting on Phone #
 * 3. Remove leading 1 or +1
 * 4. Eliminate Toll Free numbers and Numbers without area codes
 * 5. Sort by the "order" - as determined by 'pref' and 'type'
 * 6. Set all email addresses to lower case
 * 
 */

function normalizeRequest(request) {
    // Normalize Contact Info
    var contactInfo = request.contactInfo;

    if (!_.isEmpty(contactInfo)) {

        if (!_.isEmpty(contactInfo.phone)) {
            contactInfo.phone = deformatPhone(contactInfo.phone);
        }
        if (!_.isEmpty(contactInfo.email)) {
            contactInfo.email = validateEmail(contactInfo.email);
        }

        var phoneNumbers = contactInfo.phoneNumbers || contactInfo.phones;

        if (!_.isEmpty(phoneNumbers)) {
            var pn = _.isString(phoneNumbers) ? [{ value: phoneNumbers, ord: 0 }] :
                _(phoneNumbers).map(translateToPhoneObject)
                    .reject(_.isEmpty)
                    .unique('value')
                    .sortBy('order')
                    .value();

            log.debug({ func: 'normalizeRequest', src: contactInfo.phoneNumbers, out: pn }, 'Processed Phones');

            contactInfo.phoneNumbers = pn;

            if (_.isEmpty(contactInfo.phone) && !_.isEmpty(pn)) {
                contactInfo.phone = pn[0].value;
            }

        } else if (!_.isEmpty(contactInfo.phone)) {
            // If the contact info object contains a 'phone' value, but not 'phoneNumbers',
            // Push the 'phone' object into a new array.
            
            contactInfo.phoneNumbers = [translateToPhoneObject(contactInfo.phone)];
        }

        if (!_.isEmpty(contactInfo.emails)) {
            var em = _.isString(contactInfo.emails) ? [{ value: contactInfo.emails, ord: 0 }] :
                _(contactInfo.emails).map(translateToEmailObject)
                    .reject(_.isEmpty)
                    .unique('value')
                    .sortBy('order')
                    .value();

            log.debug({ func: 'normalizeRequest', src: contactInfo.emails, out: em }, 'Processed Emails');

            contactInfo.emails = em;

            if (_.isEmpty(contactInfo.email) && !_.isEmpty(em)) {
                contactInfo.email = em[0].value;
            }
        } else if (!_.isEmpty(contactInfo.email)) {
            // If the contact info object contains a 'email' value, but not 'emailNumbers',
            // Push the 'email' object into a new array.
            
            contactInfo.emails = [translateToEmailObject(contactInfo.email)];
        }
                    
        // Cleanup Extraneous fields
        delete contactInfo.checked;
        delete contactInfo.phones;
    }
            
    // Normalize and Clean up Other Fields;
    if (/^hello there/i.test(request.text)) {
        log.info({ func: 'normalizeRequest', text: request.text }, 'Removing Existing Placeholder Text')
        request.text = null;
    }
    
    // Remove 'status' field
    delete request.status;

    return request;
}

function deformatPhone(phone) {
    if (_.isEmpty(phone)) { return; }

    var newNum = phone.replace(/\D/g, '');

    // Ignore numbers without area code
    if (!newNum || newNum.length < 10) {
        return null;
    }

    // Strip the leading 'one'
    if (newNum.charAt(0) === '1') {
        newNum = newNum.slice(1);
    }
    
    // Reject toll-free numbers
    if (/^8(88|77|66|55|44|00)/.test(newNum)) {
        return null;
    }

    return newNum;
}

function validateEmail(email) {
    if (_.isEmpty(email)) { return; }

    return /^\S+@\S+\.\S+$/.test(email) ? email.toLowerCase() : null;
}

function translateToEmailObject(email) {
    log.debug({ func: 'translateToEmailObject' }, 'translating `%s`', email);
    var newEmail, ord;

    if (_.isString(email)) {
        newEmail = validateEmail(email);
        ord = 1;
    } else {
        newEmail = validateEmail(email.value);

        ord = Boolean(email.pref) ? 0 : 1;
    }

    if (_.isEmpty(newEmail)) {
        return null;
    }

    log.debug({ func: 'translateToEmailObject' }, 'formatted to `%s` [%s]', newEmail, ord);

    return { value: newEmail, order: ord };
}

function translateToPhoneObject(phone) {
    log.debug({ func: 'translateToPhoneObject' }, 'translating `%s`', phone);
    var newNum, ord;

    if (_.isString(phone)) {
        newNum = deformatPhone(phone);
        ord = 1;
    } else {
        newNum = deformatPhone(phone.value);

        if (Boolean(phone.pref) && /mobile|iphone/i.test(phone.type)) {
            ord = 0;
        } else if (/mobile|iphone/i.test(phone.type)) {
            ord = 1;
        } else {
            ord = 2;
        }
    }

    log.debug({ func: 'translateToPhoneObject' }, 'formatted to `%s` [%s]', newNum, ord);

    if (_.isEmpty(newNum)) {
        return null;
    }

    return { value: newNum, order: ord };
}

/**
 * loadRequest
 * -----------
 * Given a 'shortId' in the request, looks up and tries to find the correspnding requests, and forwards
 * the user as appropriate.
 */

function loadRequest(req, res) {
    req.log.info({ func: 'loadRequest', params: req.params }, 'Loading Notification Request');
    var id = req.params.shortId;

    if (shortid.isValid(id)) {
        req.log.info({ func: 'loadRequest', shortId: id }, 'Looking up By ShortID?');

        return RequestMessage.findOne({ shortId: id }).exec().then(
            function success(requestMessage) {
                
                req.request = requestMessage;
                
                req.log.info({ func: 'loadRequest', reqMsg: requestMessage }, 'Found Request Message');
                var fromId = _.isEmpty(requestMessage.from) ?
                    null :
                    _.isString(requestMessage.from) ?
                        requestMessage.from :
                        requestMessage.from.toHexString();

                if (!!requestMessage && !!fromId) {
                    var url = null;
                    req.log.info({ func: 'loadRequest', fromId: fromId, requestType: requestMessage.requestType }, 'Redirecting based on request type');

                    switch (requestMessage.requestType) {
                        case 'friendRequest':
                            return NotificationCtr.processInboundReferral(req, res);
                        case 'shareRequest':
                            
                            var baseURL = '/trucker/' + fromId;
                            
                            if (requestMessage.contents && requestMessage.contents.documents && requestMessage.contents.documents.length) {
                                baseURL = baseURL + '/documents';
                            }
                        
                            url = baseURL + '?requestId=' + requestMessage.id;
                            req.log.info({ func: 'loadRequest', url: url }, 'Redirecting user to Report Documents');
                            return res.redirect(url);

                        case 'reviewRequest':
                            // if (!!requestMessage.objectLink) {
                            // 	url = '/reviews/' + requestMessage.objectLink + '/edit';
                            // } else {
                            url = '/reviews/create?requestId=' + requestMessage.id;
                            //}
                            req.log.info({ func: 'loadRequest', url: url }, 'Redirecting user to Review Creation');
                            return res.redirect(url);
                        default: req.log.error({ func: 'loadRequest' }, 'Unknown Request Type');
                    }
                } else if (!fromId) {
                    req.log.error({ requestMesage: requestMessage }, 'Request has no sender');
                } else {
                    req.log.error({ requestMessage: requestMessage }, 'Unable to process request');
                }

                return res.redirect('/not-found');
            },
            function fail(err) {
                req.log.error({ err: err, params: req.params }, 'Unable to load request');
                return res.redirect('/not-found');
            });
    }
    else {
        return res.redirect('/not-found');
    }
}