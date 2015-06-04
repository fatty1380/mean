'use strict';

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
exports.loadFriends = function (req, res, next) {

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
 * Adds a new UserId to the requesting Profile's [FRIENDS]
 * @param req
 * @param res
 * @param next
 */

exports.addFriend = function (req, res, next) {
    
    // TODO: Check for existing requests, both sender and recipient (?);
    if (!!req.profile && !req.user.isAdmin) {
        return res.status(403).send({ message: 'Cannot add friends for other users' });
    }

    var me = !!req.profile ? req.profile.id : req.user.id;
    var them = req.param('friendId');

    req.log.debug({ func: 'addFriend', body: req.body, friend: them }, 'Adding friend with POSTed body content');

    if (_.isEmpty(them)) {
        req.log.error({ func: 'addFriend' }, 'No Friend Parameter present in request');
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
        req.log.debug({ func: 'addFriend', friendRequest: request });

        return res.json(request);
    });
};

exports.listRequests = function (req, res) {
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

        }
        )
}

exports.getRequest = function (req, res, next) {
    return res.json(req.request);
}

exports.updateRequest = function (req, res, next) {

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

exports.acceptRequest = function (req, res, next) {

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

exports.rejectRequest = function (req, res, next) {
    next(new Error('not implemented'));
};

exports.removeFriend = function (req, res, next) {

    req.log.debug({ func: 'removeFriend', profile: req.profile.id, friend: req.params.friendId }, 'Removing friend from DELETE method call');

    next(new Error('not implemented'));
};

exports.requestById = function (req, res, next, id) {

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