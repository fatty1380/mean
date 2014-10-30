'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Application = mongoose.model('Application'),
    _ = require('lodash');

/**
 * "Instance" Methods
 */

var executeQuery = function(req, res, next) {

    var query = req.query;

    Application.find(query)
        .populate('user', 'displayName')
        .populate('job', 'user')
        .exec(function(err, applications) {
            if (err) return next(err);
            req.applications = applications || [];

            console.log('[ApplicationsCtrl.executeQuery] Found %d applications for query %s', req.applications.length, query);

            next();
        });
};

/**
 * Create a Application
 */
exports.create = function(req, res) {
    var application = new Application(req.body);
    application.user = req.user;
    application.job = req.job;

    application.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(application);
        }
    });
};

/**
 * Show the current Application
 */
exports.read = function(req, res) {
    res.jsonp(req.application);
};

exports.readList = function(req, res) {
    res.jsonp(req.applications);
};

/**
 * Update a Application
 */
exports.update = function(req, res) {
    var application = req.application;

    application = _.extend(application, req.body);

    application.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(application);
        }
    });
};

/**
 * Delete an Application
 */
exports.delete = function(req, res) {
    var application = req.application;

    application.remove(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(application);
        }
    });
};

/**
 * List of *ALL* Applications
 */
exports.list = function(req, res) {

    req.query = {};

    executeQuery(req, res, null);
};

exports.queryByJobID = function(req, res, next, jobId) {

    if (!jobId) {
        console.log('[ApplicationsCtrl.queryByJobId]', 'Cannot search without a jobId');
        return next(new Error('Must include jobID in request to find Applications by job'));
    }

    var query = {
        job: jobId
    };

    var user = req.user;

    if (!!user && user.type.toLowerCase() === 'driver') {
        query.user = user.id;
    }

    req.query = query;

    executeQuery(req, res, next);

};

exports.loadMine = function(req, res) {
    return this.queryByUserID(req, res, null, req.user._id);
};

exports.queryByUserID = function(req, res, next, id) {
    req.query = {
        user: id
    };

    executeQuery(req, res, next);
};

/**
 * Application middleware
 */
exports.applicationByID = function(req, res, next, id) {
    Application.findById(id)
        .populate('user', 'displayName')
        .populate('job')
        .populate('messages.sender')
        .exec(function(err, application) {
            if (err) return next(err);
            if (!application) return next(new Error('Failed to load Application ' + id));
            req.application = application;
            next();
        });
};

/**
 * Application authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
    if (req.application.user.id !== req.user.id) {
        return res.status(403).send('User is not authorized');
    }
    next();
};
