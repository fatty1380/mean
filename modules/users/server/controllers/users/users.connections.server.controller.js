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
    Request = mongoose.model('RequestMessage'),
    path = require('path'),
    messenger = require(path.resolve('./modules/emailer/server/controllers/messenger.server.controller')),
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

    Request.find({ status: { $ne: 'rejected' } })
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

    if (_.isEmpty(req.body.to) && _.isEmpty(req.body.contactInfo)) {
        req.log.error({ func: 'createRequest' }, 'No Friend Parameter present in request');
        return res.status(400).send({ message: 'No Friend Specified in Request' });
    }

    delete req.body.status;

    var request = new Request(req.body);
    request.from = req.user._id;

    // Insert
    var u1 = User.where({ '_id': { '$in': [me, req.body.to] } })
        .update(
            { '$push': { 'requests': { '_id': request } } },
            { 'new': true, 'upsert': true }
        );
        
    var u2;
    if (_.isEmpty(req.body.to) && !_.isEmpty(req.body.contactInfo)) {
        u2 = messenger.sendMessage({to: req.body.contactInfo.phones})
    }

    return Q.all([request.save(), u1.exec()])
        .then(function (results) {
        req.log.debug({ func: 'createRequest', friendRequest: results[0], users: results[1] });

            return res.json(results[0]);
        });
}

function listRequests(req, res) {
    req.log.debug({ func: 'listRequests' }, 'Start');
    
    var mainQuery = { 'to': req.user.id };

    var statuses = req.query.status === 'all' ? ['new', 'accepted'] : req.query.status || ['new'];
    mainQuery.status = statuses.length > 1 ? { $in: statuses } : statuses[0];
    
    if (req.query.requestType !== 'all') {
        var types = req.query.requestType || ['friendRequest'];
        
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

    Request.find().exec()
        .then(function (reqs) {
            req.log.debug({ func: 'listRequests', allRequests: reqs }, 'Listing all requests for debugging');

            return Request.find(mainQuery)
                .or(orQuery)
                .sort('created').exec()
                .then(
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
        });
}

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

function removeFriend(req, res, next) {

    req.log.debug({ func: 'removeFriend', profile: req.profile.id, friend: req.params.friendId }, 'Removing friend from DELETE method call');

    next(new Error('not implemented'));
}

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
}