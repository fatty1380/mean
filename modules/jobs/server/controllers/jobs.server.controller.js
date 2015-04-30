'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
_            = require('lodash'),
path         = require('path'),
Job          = mongoose.model('Job'),
Address      = mongoose.model('Address'),
Application  = mongoose.model('Application'),
Company      = mongoose.model('Company'),
errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
companies    = require(path.resolve('./modules/companies/server/controllers/companies.server.controller')),
log          = require(path.resolve('./config/lib/logger')).child({
    module: 'jobs',
    file: 'Jobs.Controller'
}),
moment       = require('moment'),
Q            = require('q');

/**
 * "Instance" Methods
 */

exports.executeQuery = function (req, res, next) {

    req.log.debug('ExecuteQuery', {query: req.query, sort: req.sort});

    var query = req.query || {};
    var sort = req.sort || '-posted';
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
                    req.log.error('error looking up users for applications, returning non-populated version', err);
                    next();
                }

                var options = [
                    {path: 'applications.user.driver', model: 'Driver'},
                    {path: 'applications.connection', model: 'Connection'}
                ];

                req.jobs = populated;

                Job.populate(jobs, options, function (err, populated) {
                    if (err) {
                        req.log.error('error looking up users for applications, returning non-populated version', err);
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


var incrementJobsCount = function (req) {
    if (!req.company) {
        req.log.error('No Company defined in request');
        return false;
    }

    var sub = req.company.subscription;

    if (!sub) {
        req.log.error('No Subscription for company `%s`', req.company.id);
        return false;
    }

    var renewal = moment(sub.renews);
    if (renewal < moment) {
        sub.renews = renewal.add(30, 'days');
        sub.used = 1;
    } else {
        sub.used++;
    }

    sub.save(function (err) {
        req.log.info('updated company subscription', {subscription: sub});
    });
};

/**
 * Create a Job
 */
exports.create = function (req, res) {
    req.companyId = req.company ? req.company.id : req.companyId || req.body.companyId;

    var job = new Job(req.body);

    req.log.info('Create', 'Company %s is posting a new job', req.companyId, {job: job});

    // Set properties
    job.user = req.user;
    job.company = req.company || mongoose.Types.ObjectId(req.companyId);
    job.postStatus = 'posted';
    job.posted = Date.now();

    req.log.trace('Create', 'Creating new job', {job: job});

    job.save(function (err) {
        if (err) {
            req.log.error('Create', 'Error Creating new job', {error: err, job: job});
            return res.send(400, {
                message: getErrorMessage(err) || 'Unable to create a new job at this time. Please try again later ' + (err.message ? '(' + err.message + ')' : '')
            });
        } else {
            req.log.info('Create', 'Created new job with ID `%s`', job._id);
            res.json(job);

            incrementJobsCount(req);
        }
    });


};

/**
 * Show the current Job
 */
exports.read = function (req, res) {
    req.log.info('read', 'Loaded Job', {jobId: req.job && req.job._id, query: req.query});
    req.log.trace('read', 'Loaded Job', {jobId: req.job && req.job._id, query: req.query, job: req.job});

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
    req.log.info({query: req.query, func: 'list'}, 'Found %d jobs', req.jobs.length);
    req.log.trace({query: req.query, jobs: req.jobs, func: 'list'}, 'Found %d jobs', req.jobs.length);
    res.json(req.jobs);
};

/**
 * Update a Job
 */
exports.update = function (req, res) {
    req.log.trace('update', 'START', {body: req.body});
    var job = req.job;

    debugger;

    job = _.extend(job, req.body);

    //job.location = Address.map(req.body.location);
    job.location = req.body.location;

    req.log.trace('update', 'Saving job', {job: job});

    job.save(function (err) {
        if (err) {
            req.log.error('Update', 'Error Saving job', err);
            return res.send(400, {
                message: getErrorMessage(err)
            });
        } else {
            req.log.trace('update', 'Successfully Saved job', {job: job});
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

/** * List of a user's posted jobs
 */
exports.queryByUserID = function (req, res, next) {
    req.log.trace('queryByUserID', 'Querying by companyId', {companyId: req.params.userId, query: req.query});

    req.query = {
        user: req.params.userId
    };

    next();
};

/**
 * List of a company's posted jobs
 */
exports.queryByCompanyID = function (req, res, next) {
    req.log.trace('queryByCompanyID', 'Querying by companyId', {companyId: req.params.companyId, query: req.query});

    req.query = {
        company: req.params.companyId
    };

    next();
};

exports.populateApplications = function (req, res, next) {
    req.log.trace('populateApplications', 'populating applications');
    req.populate = [{property: 'applications', fields: ''}];

    next();
};

/**
 * Job middleware
 */
exports.jobByID = function (req, res, next, id) {

    req.log.debug('JobById', 'Loading job by id %s. URL: %s', {jobId: id, url: req.url});
    req.log.trace('JobById', 'Request body', {reqBody: req.body, jobId: id, url: req.url});

    Job.findById(id)
        .populate('user', 'displayName email')
        .populate('company')
        .exec(function (err, job) {
            if (err) {
                req.log.error('JobById', 'Error while loading job', {error: err});
                return next(err);
            }

            if (!!req.user && !!req.user.driver) {
                req.log.debug('JobById', 'Requesting User has Driver defined!', {
                    user: req.user,
                    driver: req.user.driver
                });
            } else if (!!req.user && !!req.user.company) {
                req.log.debug('JobById', 'Requesting User has Company defined!', {
                    user: req.user,
                    company: req.user.company
                });
            }

            req.log.debug('JobById', 'Returning job', {jobId: !!job && job._id});
            req.log.trace('JobById', 'Returning job', {jobId: !!job && job._id, job: job});

            req.job = job;
            next();
        });
};

/**
 * Job authorization middleware
 */
exports.hasAuthorization = function (req, res, next) {
    if (req.job.user.id !== req.user.id) {
        req.log.warn('hasAuthorization', 'User is NOT Authorized');
        return res.send(403, 'User is not authorized');
    }

    req.log.trace('hasAuthorization', 'User is Authorized');
    next();
};

exports.validateSubscription = function (req, res, next) {

    req.companyId = req.body.companyId;

    Company.findById(req.companyId)
        .populate('subscription')
        .exec(function (err, company) {
            if (err || !company) {
                req.log.warn('ValidateSubscription', 'Unable to find Company', {companyId: req.companyId});
                return res.status(404).send({message: 'Unable to find company', error: err});
            }

            if (!company.subscription) {
                req.log.warn('ValidateSubscription', 'No Subscription object');
                return res.status(403).send({message: 'No Active Subscription'});
            }
            else if(!company.subscription.isValid) {
                req.log.warn('ValidateSubscription', 'Invalid Subscription: %s', company.subscription.statusMessage, {subscription: company.subscription});
                return res.status(403).send({message: company.subscription.statusMessage});
            }

            req.company = company;

            next();
        });

};
