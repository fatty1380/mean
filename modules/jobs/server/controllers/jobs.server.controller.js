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
Q            = require('q');

/**
 * "Instance" Methods
 */

exports.executeQuery = function (req, res, next) {

    console.log('[JobCtrl] ExecuteQuery');

    var query = req.query || {};
    var sort = req.sort || '';
    var populate = [
        {property: 'user', fields: 'displayName'},
        {property: 'company', fields: null}
    ];

    if (req.populate) {
        req.populate = _.union(populate, req.populate);
    }

    query.isDeleted = req.params && !!req.params.includeDeleted;

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
                {path: 'applications.messages'}
            ];

            Job.populate(jobs, options, function (err, populated) {
                if (err) {
                    console.log('error looking up users for applications, returning non-populated version', err);
                    next();
                }

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
    if(req.body && req.body.companyId === '54d262e3182c6f303013462d') {
        console.error('[Job.Create] START with reqBody: %j', req.body);
        console.log('[Job.Create] START with reqBody: %j', req.body);
    }

    var job = new Job(req.body);

    console.log('[Job.Create] Company %s is posting job with headline `%s`', req.body.companyId, job.name);

    // Set properties
    job.user = req.user;
    console.log('[Job.Create] with user `%s`', job.user && job.user._id ? job.user._id : job.user);
    job.company = mongoose.Types.ObjectId(req.body.companyId);
    console.log('[Job.Create] new job with company `%s`', job.company);
    job.postStatus = 'posted';
    console.log('[Job.Create] new job with status `%s`', job.postStatus);
    job.posted = Date.now();

    console.log('[Job.Create] Creating new job: %j', job);

    job.save(function (err) {
        if (err) {
            console.error('[Job.Create] Error Creating new job: %j\n\t%j', err, job);
            return res.send(400, {
                message: getErrorMessage(err) || 'Unable to create a new job at this time. Please try again later '+ (err.message ? '('+err.message+')': '')
            });
        } else {
            console.log('[Job.Create] Creating new job with ID `%s`', job._id);
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
            console.log('[Job.Update] Error Saving job: %j', err);
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
    console.log('populating applications');
    req.populate = [{property: 'applications', fields: ''}];

    next();
};

/**
 * Job middleware
 */
exports.jobByID = function (req, res, next, id) {

    console.log('[JobById] Loading job by id %s', id);

    Job.findById(id)
        .populate('user', 'displayName email')
        .populate('company')
        .exec(function (err, job) {
            if (err) {
                console.log('[JobById] Error: %j', err);
                return next(err);
            }

            if (!!req.user && !!req.user.driver) {
                console.log('[JobById] Both User and Driver are defined in the request!');

            }

            console.log('[JobById] Returning job %s', !!job && job._id);

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
