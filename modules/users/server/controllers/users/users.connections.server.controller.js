'use strict';
/** Friends & Connections Controller
 * ----------------------------------
 * @example none entered
 */
    
/** Friend Operations */
exports.loadFriends = loadFriends;
exports.removeFriend = removeFriend;
exports.checkFriendStatus = checkFriendStatus;

exports.updateFriendRequest = updateFriendRequest;

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



function updateFriendRequest(req, res, next) {

    if (_.isEmpty(req.request) || req.request.requestType !== 'friendRequest') {
        return next();
    }

    var action = req.body.action || req.query.action;
    req.log.debug({ func: 'updateRequest', action: action }, 'Updating request based on action: `%s`', action);

    if (action === 'accept') {
        return acceptFriendRequest(req, res, next).then(
            function (success) {
                res.json(req.request);
            },
            function (err) {
                req.log.error({ func: 'acceptRequest', error: err }, 'Unable to accept friend');
                next(err);
            });
    }

    if (action === 'reject') {
        return rejectFriendRequest(req, res, next).then(
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

function acceptFriendRequest(req, res, next) {

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

function rejectFriendRequest(req, res, next) {
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
