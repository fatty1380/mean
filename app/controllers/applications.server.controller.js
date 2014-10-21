'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors'),
    Application = mongoose.model('Application'),
    _ = require('lodash');

/**
 * Create a Application
 */
exports.create = function(req, res) {
    var application = new Application(req.body);
    application.user = req.user;

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
 * List of Applications
 */
exports.list = function(req, res) {
    debugger;

    Application
        .find()
        .sort('-created')
        .populate('user', 'displayName')
        .exec(function(err, applications) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.jsonp(applications);
            }
        });
};

exports.queryByJobID = function(req, res, next, jobId) {

    debugger; // TODO: See if Query Parameter is properly passed

    if (!jobId) {
        console.log('[ApplicationsCtrl.queryByJobId]', 'Cannot search without a jobId');
        return next(new Error('Must include jobID in request to find Applications by job'));
    }

    Application.findById(jobId)
        .exec(function(err, applications) {
            if (err) {
                return res.status(400).send({
                    message: 'Failed to load applications for JobId ' + jobId,
                    error: err
                });
            }

            console.log('[ApplicationsCtrl.queryByJobId] ' + 'Found %d applications for jobId', (applications || []).length, jobId);

            res.jsonp(applications || []);
        });
};

exports.loadMine = function(req, res) {
    return this.queryByUserID(req, res, null, req.user._id);
};

exports.queryByUserID = function(req, res, next, id) {

    debugger; // TODO: See if Query Parameter is properly passed
    var userId = id || (req.user ? req.user._id : null);

    Application.find({
            'user': userId
        })
        .exec(function(err, applications) {
            if (err) {
                return res.status(400).send({
                    message: 'Failed to load applications for userId ' + userId,
                    error: err
                });
            }

            console.log('[ApplicationsCtrl.queryByUserId] ' + 'Found %d applications for userId', (applications || []).length, userId);

            res.jsonp(applications || []);
        });
};

/**
 * Application middleware
 */
exports.applicationByID = function(req, res, next, id) {
    Application.findById(id)
        .populate('user', 'displayName')
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
