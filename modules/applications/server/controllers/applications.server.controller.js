'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
errorHandler = require('../../../../modules/core/server/controllers/errors.server.controller'),
Application  = mongoose.model('Application'),
Message      = mongoose.model('Message'),
User         = mongoose.model('User'),
Job          = mongoose.model('Job'),
_            = require('lodash');

/**
 * "Instance" Methods
 */

var executeQuery = function (req, res) {

    var query = req.query || {};
    var sort = req.sort || '-created';

    Application.find(query)
        .sort(sort)
        .populate('user', 'displayName profileImageURL')
        .populate('job', 'name driverStatus postStatus')
        .populate('company', 'name profileImageURL')
        .exec(function (err, applications) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }

            req.applications = applications || [];
            console.log('[ApplicationsCtrl.executeQuery] Found %d applications for query %j', req.applications.length, query);
            res.json(req.applications);
        });
};

/**
 * Create a Application
 */
exports.create = function (req, res) {
    var application = new Application(req.body);

    console.log('[ApplicationController.create] req.job: %o, req.body.jobId: %o', req.job, req.body.jobId);

    application.user = req.user;
    application.job = req.job || req.body.jobId; // TODO: Figure out why this is not populated!
    application.company = req.job.company; // This should be populated by jobByID Middleware

    console.log('[ApplicationController.create] Creating new application: %o', application);

    application.save(function (err) {
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
exports.read = function (req, res) {
    if (!req.application) {
        return res.status(404).send({
            message: 'No application found'
        });
    }

    res.json(req.application);
};

/**
 * Update a Application
 */
exports.update = function (req, res) {
    var application = req.application;

    application = _.extend(application, req.body);

    application.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            var opts = [{
                path: 'sender',
                select: 'displayName',
                model: 'User'
            }];

            Application.populate(application.messages, opts,
                function (err, messages) {
                    res.json(application);
                });
        }
    });
};

/**
 * Delete an Application
 */
exports.delete = function (req, res) {
    var application = req.application;

    application.remove(function (err) {
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
exports.listAll = function (req, res) {
    debugger; // TODO : route to correct list
    req.sort = '-created';

    executeQuery(req, res);
};

exports.queryByJobID = function (req, res) {
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
    var isAdmin = !!user && ((typeof user.isAdmin !== 'undefined') ? user.isAdmin : user.roles.indexOf('admin') !== -1);

    if (!isAdmin && !!user && user.type.toLowerCase() === 'driver') {
        query.user = user.id;
    }

    req.query = query;

    executeQuery(req, res);

};

exports.queryByCompanyID = function (req, res) {
    var companyId = req.company && req.company._id || req.params.companyId;

    if (!companyId) {
        console.log('[ApplicationsCtrl.queryByCompanyID]', 'Cannot search without a companyId');
        return res.status(400).send({
            message: 'Must include companyId in request to find Applications by company'
        });
    }

    req.query = {
        company: companyId
    };

    req.sort = '-modified';

    executeQuery(req, res);
};

exports.loadMine = function (req, res) {
    return this.queryByUserID(req, res, null, req.user._id);
};

exports.queryByUserID = function (req, res) {
    req.query = {
        user: req.params.userId
    };

    executeQuery(req, res);
};

exports.getByJobId = function (req, res, next) {
    var query = {
        job: req.params.jobId,
        user: req.params.userId
    };

    Application.findOne(query)
        .exec(function (err, application) {
            if (err) {
                return next(err);
            }

            req.application = application;
            next();
        });
};

/**
 * Application middleware
 */
exports.applicationByID = function (req, res, next, id) {

    Application.findById(id)
        .populate('user', 'displayName')
        .populate('job', 'name user company')
        .populate('messages')
        .populate({
            path: 'messages.sender',
            model: 'User',
            select: 'displayName id'
        })
        .exec(function (err, application) {
            if (err) {
                return next(err);
            }

            req.application = application;
            next();
        });
};

/**
 * Application authorization middleware
 */
exports.hasAuthorization = function (req, res, next) {
    if (req.application.user.id !== req.user.id && !req.application.job.user.equals(req.user.id)) {
        return res.status(403).send('User is not authorized');
    }
    next();
};
