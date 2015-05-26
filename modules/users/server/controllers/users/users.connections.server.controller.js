'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    path         = require('path'),
    log          = require(path.resolve('./config/lib/logger')).child({
        module: 'users',
        file  : 'Authorization.Controller'
    });

/**
 * User middleware
 */
exports.loadFriends = function(req, res, next) {
    req.log.debug({func: 'loadFriends', params: req.params}, 'Loading friends for user: %s', req.user.id);

    req.user.loadFriends()
    .then(function(success) {
            req.log.debug({func: 'loadFriends', result: success}, 'Found %s\'s friends', req.user.displayName);
            return res.json(success);
        }, function(err) {
            req.log.error({func: 'loadFriends', error: err}, 'Failed to find %s\'s friends due to error', req.user.displayName);
            next(err);
        });
};

exports.addFriend = function(req, res, next) {
    next(new Error('not implemented'));
};
