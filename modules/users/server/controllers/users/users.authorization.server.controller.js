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
exports.userByID = function(req, res, next, id) {
    req.log.debug({func: 'userById', params: req.params}, 'looking up user by id: %s', id);

    if(_.isEmpty(id) || !mongoose.Types.ObjectId.isValid(id)) {
        req.log.info({func: 'userById', id: id}, 'UserID is invalid - setting request user to profile');

        req.profile = req.user;
        return next();
    }

    var select = req.select || '-password -oldPass -salt -roles';
    req.log.debug({func: 'userById', params: req.params}, 'looking up user by id: %s', id);
    User
        .findOne({
            _id: id
        })
        .select(select)
        .exec(function(err, user) {
            if (err) { return next(err); }
            if (!user) {
                return next(new Error('Failed to load User ' + id));
            }

            req.profile = user;
            next();
        });
};

/**
 * Require login routing middleware
 */
exports.requiresLogin = function(req, res, next) {
    if (!req.isAuthenticated()) {
        req.log.warn({func: 'requiresLogin'}, '401: not logged in');
        return res.status(401).send({
            message: 'User is not logged in'
        });
    }

    req.log.debug({func: 'requiresLogin'}, 'Logged In');

    next();
};

/**
 * User authorizations routing middleware
 */
exports.hasAuthorization = function(roles) {
    var _this = this;
    
    roles = roles || ['admin']

    log.debug({func: 'hasAuthorization', roles: roles}, 'Initializing Authorization Function with Roles');

    return function(req, res, next) {
        _this.requiresLogin(req, res, function() {
            if (_.intersection(req.user.roles, roles).length) {
                req.log.debug({func: 'hasAuthorization'}, 'Authorized');
                return next();
            } else {
                req.log.debug({func: 'hasAuthorization', code: 403}, 'Not Authorized');
                return res.status(403).send({
                    message: 'User is not authorized'
                });
            }
        });
    };
};
