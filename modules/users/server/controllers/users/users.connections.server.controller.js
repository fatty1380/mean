'use strict';
/** Friends & Connections Controller
 * ----------------------------------
 * @example 
 */
    
/** Friend Operations */
exports.loadFriends = loadFriends;
exports.removeFriend = removeFriend;
exports.checkFriendStatus = checkFriendStatus

/** Request Operations */
exports.listRequests = listRequests;
exports.getRequest = getRequest;
exports.createRequest = createRequest;
exports.updateRequest = updateRequest;
exports.acceptRequest = acceptRequest;
exports.rejectRequest = rejectRequest; 

/** Middleware */
exports.requestById = requestById; 

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    mongoose = require('mongoose'),
    Q = require('q'),
    User = mongoose.model('User'),
    Request = mongoose.model('RequestMessage'),
    path = require('path'),
    log = require(path.resolve('./config/lib/logger')).child({
        module: 'users',
        file: 'Authorization.Controller'
    });
    
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
};

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

    req.log.debug({ myFriends: me.friends, theirFriends: them.friends }, 'searching for friend intersection');

    var mySide = _.find(me.friends, them._id);
    var theirSide = _.find(them.friends, me._id);

    req.log.debug({ mySide: mySide, theirSide: theirSide }, 'Cross Search Results');


    if (!_.isEmpty(mySide) && !_.isEmpty(theirSide)) {

        return res.json({ status: 'friends' });
    }
    
    Request.find({status: {$ne: 'rejected'}})
    .or([{to: them._id, from: me._id}, {to: me._id, from: them._id}])
    .sort('created').exec().then(
        function (requests) {

            var myRequest = _.find(requests, { to: them._id });
            var theirRequest = _.find(requests, { from: them._id });

            req.log.debug({ them: them._id, requests: requests, myRequests: myRequest, theirRequest: theirRequest }, 'searching for requests intersection');

            var status = 'none';

            if (!!myRequest) {
                status = (function (status) {
                    switch (status) {
                        case 'new': return 'sent';
                        case 'accepted': return 'friends';
                        default: return 'none';
                    }
                })(myRequest.status);

                req.log.debug({ status: status }, 'Found myRequest status');
            }

            if (!!theirRequest) {
                status = (function (status) {
                    switch (status) {
                        case 'new': return 'pending';
                        case 'accepted': return 'friends';
                        default: return 'none';
                    }
                })(theirRequest.status);

                req.log.debug({ status: status }, 'Found theirRequest status');
            }

            return res.json({ status: status });



        });





}

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

    var me = !!req.profile ? req.profile.id : req.user.id;
    var them = req.param('friendId');

    req.log.debug({ func: 'createRequest', body: req.body, friend: them }, 'Adding friend with POSTed body content');

    if (_.isEmpty(them)) {
        req.log.error({ func: 'createRequest' }, 'No Friend Parameter present in request');
        return res.status(400).send({ message: 'No Friend Specified in Request' });
    }

    var request = new Request({
        requestType: Request.reqTypes.friendRequest,
        from: me,
        to: them,
        message: req.body.message || ''
    });

    return request.save()
        .then(function (request) {
        req.log.debug({ func: 'createRequest', friendRequest: request });

        return res.json(request);
    });
};

function listRequests(req, res) {
    req.log.debug({ func: 'listRequests' }, 'Start');

    var statuses = req.param('status') || ['new'];
    statuses = statuses.length > 1 ? { $in: statuses } : statuses;

    req.log.debug({ func: 'listRequests', statuses: statuses, query: req.query }, 'Executing find');

    return Request.find({ 'to': req.user.id, 'status': statuses }).exec().then(
        function (requests) {
            if (!requests) {
                requests = [];
            }

            req.log.debug({ func: 'listRequests', requests: requests }, 'Found Requests based on query');
            return res.json(requests);
        },
        function (err) {
            req.log.error({ func: 'listRequests', error: err }, 'Unable to find requests due to error');

        });
}

function getRequest(req, res, next) {
    return res.json(req.request);
}

function updateRequest(req, res, next) {

    var action = req.param('action');
    req.log.debug({ func: 'updateRequest', action: action }, 'Updating request based on action: `%s`', action);

    if (action === 'accept') {
        return exports.acceptRequest(req, res, next).then(
            function (success) {
                res.json(req.request);
            },
            function (err) {
                req.log.error({ func: 'acceptRequest', error: err }, 'Unable to accept friend');
                next(err);
            });
    }

    if (action === 'deny') {
        exports.rejectRequest(req, res, next);
        return;
    }

    req.log.warn({ func: 'updateRequest', action: action }, 'Unknown Action specified: `%s`', action);
    return res.status(400).send({ message: 'Unknown Action', action: action });
}

function acceptRequest(req, res, next) {

    var request = req.request;
    var user = req.profile || req.user;

    if (!req.user.isAdmin && (!!req.profile || !req.user._id.equals(request.to))) {
        return Q.reject({ statusCode: 403, message: 'Cannot accept friends for other users' });
    };
    
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
        });
};

function rejectRequest(req, res, next) {
    next(new Error('not implemented'));
};

function removeFriend(req, res, next) {

    req.log.debug({ func: 'removeFriend', profile: req.profile.id, friend: req.params.friendId }, 'Removing friend from DELETE method call');

    next(new Error('not implemented'));
};

function requestById(req, res, next, id) {

    Request.findById(id)
    //.populate('from', 'displayName')
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
};