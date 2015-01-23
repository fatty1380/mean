'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
_            = require('lodash'), path = require('path'),
Job          = mongoose.model('Job'),
Address      = mongoose.model('Address'),
Application  = mongoose.model('Application'),
errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
companies    = require(path.resolve('./modules/companies/server/controllers/companies.server.controller')),
Q            = require('Q');

/**
 * "Instance" Methods
 */

exports.executeQuery = function (req, res, next) {

    var query = req.query || {};
    var sort = req.sort || '';
    var populate = [{property: 'user', fields: 'displayName'}, {property: 'company', fields: null}];
    if (req.populate) {
        req.populate = _.union(populate, req.populate);
    }

    var base = Job.find(query)
        .populate('user', 'displayName')
        .populate('company')
        .populate('applications')
        .sort(sort);

    base.exec(function (err, jobs) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }

        req.jobs = jobs || [];

        if (req.jobs.length > 0 && !!_.find(req.populate, {'property': 'applications'})) {

            var options = [
                {path: 'applications.user', model: 'User'},
            ];

            Job.populate(jobs, options, function (err, populated) {
                if (err) {
                    console.log('error looking up users for applications, returning non-populated version', err);
                    next();
                }
                console.log('[Job.ExecuteQuery1] %s', JSON.stringify(populated[1].applications[0].toObject(), undefined, 2));

                var options = [
                    {path: 'applications.user.driver', model: 'Driver'},
                    {path: 'applications.connection', model: 'Connection'}
                ];

                req.jobs = populated;

                Job.populate(jobs, options, function (err, populated) {
                    if (err) {
                        console.log('error looking up users for applications, returning non-populated version', err);
                        next();
                    }
                    console.log('[Job.ExecuteQuery1] %s', JSON.stringify(populated[1].applications[0].toObject(), undefined, 2));

                    req.jobs = populated;
                    next();

                });

            });
        }
        else {
            next();
        }
    });
};

/**
 * Get the error message from error object
 */
var getErrorMessage = function (err) {
    var message = '';

    if (err.code) {
        switch (err.code) {
            case 11000:
            case 11001:
                message = 'Job already exists';
                break;
            default:
                message = 'Something went wrong';
        }
    } else {
        for (var errName in err.errors) {
            if (err.errors[errName].message) {
                message = err.errors[errName].message;
            }
        }
    }

    return message;
};

/**
 * Create a Job
 */
exports.create = function (req, res) {

    var job = new Job(req.body);

    // Set properties
    job.user = req.user;
    job.company = mongoose.Types.ObjectId(req.body.companyId);
    job.postStatus = 'posted';
    job.posted = Date.now();

    job.save(function (err) {
        if (err) {
            return res.send(400, {
                message: getErrorMessage(err)
            });
        } else {
            res.json(job);
        }
    });


};

/**
 * Show the current Job
 */
exports.read = function (req, res) {
    if (!req.job) {
        return res.status(404).send({
            message: 'No job found'
        });
    }

    res.json(req.job);
};

/**
 * List of Jobs stored in request
 */
exports.list = function (req, res) {
    console.log('[JobsCtrl.executeQuery] Found %d jobs for query %j', req.jobs.length, req.query);
    res.json(req.jobs);
};

/**
 * Update a Job
 */
exports.update = function (req, res) {
    var job = req.job;

    debugger;

    job = _.extend(job, req.body);

    job.save(function (err) {
        if (err) {
            return res.send(400, {
                message: getErrorMessage(err)
            });
        } else {
            res.json(job);
        }
    });
};

/**
 * Delete an Job
 */
exports.delete = function (req, res) {
    var job = req.job;

    job.remove(function (err) {
        if (err) {
            return res.send(400, {
                message: getErrorMessage(err)
            });
        } else {
            res.json(job);
        }
    });
};


exports.queryAll = function (req, res, next) {
    req.sort = '-created';

    next();
};

/** * List of a user's posted jobs
 */
exports.queryByUserID = function (req, res, next) {
    req.query = {
        user: req.params.userId
    };

    next();
};

/**
 * List of a company's posted jobs
 */
exports.queryByCompanyID = function (req, res, next) {

    req.query = {
        company: req.params.companyId
    };

    next();
};

exports.populateApplications = function (req, res, next) {
    req.populate = [{property: 'applications', fields: ''}];

    next();
};

/**
 * Job middleware
 */
exports.jobByID = function (req, res, next, id) {

    console.log('Loading job by id %s', id);

    Job.findById(id)
        .populate('user', 'displayName')
        .populate('company')
        .exec(function (err, job) {
            if (err) {
                return next(err);
            }
            req.job = job;
            next();
        });
};

/**
 * Job authorization middleware
 */
exports.hasAuthorization = function (req, res, next) {
    if (req.job.user.id !== req.user.id) {
        return res.send(403, 'User is not authorized');
    }
    next();
};
