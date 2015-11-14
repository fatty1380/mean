'use strict';
/** Friends & Connections Controller
 * ----------------------------------
 * @example none entered
 */
    
/** Friend Operations */
exports.loadFriends = loadFriends;
exports.removeFriend = removeFriend;
exports.checkFriendStatus = checkFriendStatus;

/** Request Operations */
exports.listRequests = listRequests;
exports.getRequest = getRequest;
exports.createRequest = createRequest;
exports.updateRequest = updateRequest;

/** Middleware */
exports.requestById = requestById; 

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    mongoose = require('mongoose'),
    Q = require('q'),
    User = mongoose.model('User'),
    RequestMessage = mongoose.model('RequestMessage'),
    path = require('path'),
    messenger = require(path.resolve('./modules/emailer/server/controllers/messenger.server.controller')),
    NotificationCtr = require(path.resolve('./modules/emailer/server/controllers/notifications.server.controller')),
    log = require(path.resolve('./config/lib/logger')).child({
        module: 'users',
        file: 'Authorization.Controller'
    });

/**
 * Adds a new UserId to the requesting Profile's [FRIENDS]
 * @param req
 * @param res
 * @param next
 */

function createRequest(req, res, next) {
    
    // TODO: Check for existing requests, both sender and recipient (?);
    if (!!req.profile && !req.user.isAdmin) {
        return res.status(403).send({ message: 'Cannot add friends for other users' });
    }
    
    // Setup variables for search
    if (!req.user.isAdmin && (!_.isEmpty(req.profile) && !req.profile.id.equals(req.user.id))) {
        req.log.error({ func: 'createRequest' }, 'Cannot make requests for other users if not admin');
        return res.status(401).send({ message: 'Sorry, but you cannot add friends for other users' });
    }

    var me = !!req.profile ? req.profile.id : req.user.id;

    req.log.debug({ func: 'createRequest', body: req.body, friend: req.body.to }, 'Adding friend with POSTed body content');

    if (req.body.requestType !== 'reportRequest' && _.isEmpty(req.body.to) && _.isEmpty(req.body.contactInfo)) {
        req.log.error({ func: 'createRequest' }, 'No Friend Parameter present in request');
        return res.status(400).send({ message: 'No Friend Specified in Request' });
    }

    debugger;
    var request = new RequestMessage(normalizeRequest(req.body));
    debugger;
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
    req.log.debug({ func: 'listRequests' }, 'Start');

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

    req.log.debug({ func: 'listRequests', query: req.query, statuses: statuses, types: types, mainQuery: mainQuery, orQuery: orQuery }, 'Executing find');

    return RequestMessage.find(mainQuery)
        .or(orQuery)
        .sort('created')
        .exec()
        .then(
            function (requests) {
                req.log.debug({ func: 'listRequests' }, 'Found Requests');
                if (!requests) {
                    requests = [];
                }

                req.log.debug({ func: 'listRequests', requests: requests }, 'Found Requests based on query');
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

    var action = req.body.action || req.query.action;
    req.log.debug({ func: 'updateRequest', action: action }, 'Updating request based on action: `%s`', action);

    if (action === 'accept') {
        return acceptRequest(req, res, next).then(
            function (success) {
                res.json(req.request);
            },
            function (err) {
                req.log.error({ func: 'acceptRequest', error: err }, 'Unable to accept friend');
                next(err);
            });
    }

    if (action === 'reject') {
        return rejectRequest(req, res, next).then(
            function success(result) {
                res.json(req.request);
            },
            function reject(err) {
                req.log.error({ func: 'rejectRequest', error: err }, 'Unable to reject friend');
                next(err);
            });
    }

    req.log.warn({ func: 'updateRequest', action: action }, 'Unknown Action specified: `%s`', action);
    return res.status(400).send({ message: 'Unknown Action', action: action });
}

function acceptRequest(req, res, next) {

    var request = req.request;
    var user = req.profile || req.user;

    if (!req.user.isAdmin && (!!req.profile || !req.user._id.equals(request.to))) {
        return Q.reject({ statusCode: 403, message: 'Cannot accept friends for other users' });
    }
    
    // We need to accept the request, and update the friends arrays
    request.status = 'accepted';

    req.log.debug({ func: 'acceptRequest', request: request, from: request.from, to: user },
        'Preparing to save changes');
    req.log.debug({ func: 'acceptRequest', friends: user.friends }, 'Pushing %s into %s\'s friends array', request.from, user.id);
    req.log.debug({ func: 'acceptRequest' }, 'Pushing %s into %s\'s friends array', user._id, request.from);

    var u1 = User.findByIdAndUpdate(
        user.id,
        { '$push': { 'friends': { '_id': request.from } } },
        { 'new': true, 'upsert': true }
        );
    var u2 = User.findByIdAndUpdate(
        request.from,
        { '$push': { 'friends': { '_id': user._id } } },
        { 'new': true, 'upsert': true }
        );

    req.log.debug({ func: 'acceptRequest', request: request }, 'Preparing to save changes');

    return Q.all([request.save(), u1.exec(), u2.exec()]).then(
        function (results) {
            request = results[0];
            u1 = results[1];
            u2 = results[2];

            req.log.debug({ func: 'acceptRequest', request: request, u1: u1, u2: u2 }, 'Response from saving');

            req.request = request;

            return request;
        });
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
/////////////////////////////////////////////////////////////////////////////////////////////////////

   
/**
 * Schema Definition for Friends
 * 
 *    friends: [{
 *        type: Schema.ObjectId,
 *        ref: 'User'
 *    }],
 *    
 *    requests: [{
 *       type: Schema.ObjectId,
 *       ref:'RequestMessage' 
 *   }],
 */

/**
 * User middleware
 */
function loadFriends(req, res, next) {

    req.log.debug({ func: 'loadFriends', user: req.user.id, profile: req.profile && req.profile.id }, 'Beginning friend query based on user and profile');

    var user = req.profile || req.user;

    req.log.debug({ func: 'loadFriends', params: req.params }, 'Loading friends for user: %s', user.id);

    user.loadFriends().then(
        function (success) {
            req.log.debug({ func: 'loadFriends', result: success }, 'Found %s\'s friends', user.username);
            return res.json(success);
        }, function (err) {
            req.log.error({ func: 'loadFriends', error: err }, 'Failed to find %s\'s friends due to error', user.username);
            next(err);
        });
}

/**
 * checkFriendStatus
 * @description Checks the status of the link between friends
 * 
 * @returns status String ['me', 'friends', 'sent', 'pending', 'none']
 */
function checkFriendStatus(req, res, next) {
    debugger;
    var me = req.user;
    var them = req.profile;

    if (me.equals(them)) {
        return res.json({ status: 'me' });
    }

    req.log.debug({ myFriends: me.friends, theirFriends: them.friends },
        'searching for friend intersection');

    var mySide = _.find(me.friends, them._id);
    var theirSide = _.find(them.friends, me._id);

    req.log.debug({ mySide: mySide, theirSide: theirSide }, 'Cross Search Results');


    if (!_.isEmpty(mySide) && !_.isEmpty(theirSide)) {

        return res.json({ status: 'friends' });
    }

    RequestMessage.find({ status: { $ne: 'rejected' } })
        .or([{ to: them._id, from: me._id }, { to: me._id, from: them._id }])
        .sort('created').exec().then(
            function (requests) {

                var myRequest = _.find(requests, { to: them._id });
                var theirRequest = _.find(requests, { from: them._id });

                req.log.debug({ them: them._id, requests: requests, myRequests: myRequest, theirRequest: theirRequest }, 'searching for requests intersection');

                var status = 'none';
                var request = null;

                if (!!myRequest) {
                    status = (function (status) {
                        switch (status) {
                            case 'new': return 'sent';
                            case 'accepted': return 'friends';
                            default: return 'none';
                        }
                    })(myRequest.status);

                    request = myRequest;

                    req.log.debug({ status: status }, 'Found myRequest status');
                }
                else if (!!theirRequest) {
                    status = (function (status) {
                        switch (status) {
                            case 'new': return 'pending';
                            case 'accepted': return 'friends';
                            default: return 'none';
                        }
                    })(theirRequest.status);

                    request = theirRequest;
                    req.log.debug({ status: status }, 'Found theirRequest status');
                }

                return res.json({ status: status, request: request });
            });
}

function rejectRequest(req, res, next) {
    var request = req.request;
    var user = req.profile || req.user;

    if (!req.user.isAdmin && (!!req.profile || !req.user._id.equals(request.to))) {
        return Q.reject({ statusCode: 403, message: 'Cannot accept friends for other users' });
    }

    request.status = 'rejected';
    return request.save().then(function success(result) {
        req.request = result;
        return result;
    });
}

/**
 * removeFriend
 * 
 */
function removeFriend(req, res, next) {

    req.log.debug({ func: 'removeFriend', profile: req.profile.id, friend: req.params.friendId }, 'Removing friend from DELETE method call');

    next(new Error('not implemented'));
}

///////////////////////////////////////////////////////////////////////////////////////

var BranchData = mongoose.model('BranchData');

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