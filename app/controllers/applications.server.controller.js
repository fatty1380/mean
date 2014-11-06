'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Application = mongoose.model('Application'),
    Message = mongoose.model('Message'),
    User = mongoose.model('User'),
    Job = mongoose.model('Job'),
    _ = require('lodash');

/**
 * "Instance" Methods
 */

var executeQuery = function(req, res) {

    var query = req.query || {};
    var sort = req.sort || '';

    Application.find(query)
        .sort(sort)
        .populate('user', 'displayName')
        .populate('job', 'name')
        .exec(function(err, applications) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }

            req.applications = applications || [];
            console.log('[ApplicationsCtrl.executeQuery] Found %d applications for query %s', req.applications.length, query);
            res.json(req.applications);
        });
};

/**
 * Create a Application
 */
exports.create = function(req, res) {
    var application = new Application(req.body);
    var messages = req.body.messages;

    application.user = req.user;
    application.job = req.job || req.body.jobId; // TODO: Figure out why this is not populated!

    application.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(application);
        }
    });
};

/**
 * Show the current Application
 */
exports.read = function(req, res) {
    res.json(req.application);
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
            debugger;

            var opts = [{
                path: 'sender',
                select: 'displayName',
                model: 'User'
            }];

            Application.populate(application.messages, opts,
                function(err, messages) {
                    debugger;


                    res.json(application);
                });
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
            res.json(application);
        }
    });
};

/**
 * List of *ALL* Applications
 */
exports.list = function(req, res) {
    req.sort = '-created';

    executeQuery(req, res);
};

exports.queryByJobID = function(req, res) {
    var jobId = req.params.jobId;

    if (!jobId) {
        console.log('[ApplicationsCtrl.queryByJobId]', 'Cannot search without a jobId');
        return res.status(400).send({
            message: 'Must include jobID in request to find Applications by job'
        });
    }

    var query = {
        job: jobId
    };

    var user = req.user;

    if (!!user && user.type.toLowerCase() === 'driver') {
        query.user = user.id;
    }

    req.query = query;

    executeQuery(req, res);

};

exports.loadMine = function(req, res) {
    return this.queryByUserID(req, res, null, req.user._id);
};

exports.queryByUserID = function(req, res) {
    req.query = {
        user: req.params.userId
    };

    executeQuery(req, res);
};

/**
 * Application middleware
 */
exports.applicationByID = function(req, res, next, id) {

    if (!req.originalUrl.endsWith(id)) {
        debugger;
        return next();
    }

    Application.findById(id)
        .populate('user', 'displayName')
        .populate('job', 'name company')
        .populate({path:'messages.sender', model:'User', select: 'displayName id'})
        .exec(function(err, application) {
            if (err) return next(err);
            if (!application) return next(new Error('Failed to load Application ' + id));

            debugger;
            //console.log('Job has user: ', application.job.user);

            req.application = application;
            next();


        });
};

/**
 * Application authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
    if (req.application.user.id !== req.user.id && !req.application.job.user.equals(req.user.id)) {
        return res.status(403).send('User is not authorized');
    }
    next();
};
