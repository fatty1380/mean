'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Job = mongoose.model('Job'),
    Address = mongoose.model('Address'),
    errorHandler = require('./errors.server.controller'),
    _ = require('lodash');

/**
 * "Instance" Methods
 */

var executeQuery = function(req, res) {

    var query = req.query || {};
    var sort = req.sort || '';

    Job.find(query)
        .sort(sort)
        .populate('user', 'displayName')
        .populate('location')
        .exec(function(err, jobs) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }

            req.jobs = jobs || [];
            console.log('[JobsCtrl.executeQuery] Found %d jobs for query %o', req.jobs.length, query);
            res.json(req.jobs);
        });
};

/**
 * Get the error message from error object
 */
var getErrorMessage = function(err) {
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
            if (err.errors[errName].message) message = err.errors[errName].message;
        }
    }

    return message;
};

/**
 * Create a Job
 */
exports.create = function(req, res) {

    var address = new Address(req.body.location);

    address.save(function(err) {
        if (err) {
            return res.send(400, {
                message: getErrorMessage(err)
            });

        } else {
            req.body.location = address._id;
            req.body.user = req.user._id;
            var job = new Job(req.body);
            //job.location = address; //._id;
            //job.user = req.user; //._id;

            job.save(function(err) {
                if (err) {
                    return res.send(400, {
                        message: getErrorMessage(err)
                    });
                } else {
                    res.json(job);
                }
            });
        }
    });


};

/**
 * Show the current Job
 */
exports.read = function(req, res) {
    res.json(req.job);
};

/**
 * Update a Job
 */
exports.update = function(req, res) {
    var job = req.job;
    var address = job.location;

    job = _.extend(job, req.body);
    address = _.extend(address, req.body.location);

    address.save(function(err) {
        if (err) {
            return res.send(400, {
                message: getErrorMessage(err)
            });
        } else {
            job.save(function(err) {
                if (err) {
                    return res.send(400, {
                        message: getErrorMessage(err)
                    });
                } else {
                    res.json(job);
                }
            });
        }
    });
};

/**
 * Delete an Job
 */
exports.delete = function(req, res) {
    var job = req.job;

    job.remove(function(err) {
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
 * List of Jobs
 */
exports.list = function(req, res) {
    req.sort = '-created';

    executeQuery(req, res);
};

/**
 * List of a user's posted jobs
 */
exports.queryByUserID = function(req, res) {
    req.query = {
        user: req.params.userId
    };

    executeQuery(req, res);
};

/**
 * List of a company's posted jobs
 */
exports.queryByCompanyID = function(req, res) {

    req.query = {
        company: req.params.companyId
    };

    executeQuery(req, res);
};

/**
 * Job middleware
 */
exports.jobByID = function(req, res, next, id) {

    //    if (!req.originalUrl.endsWith(id)) {
    //        next();
    //        return;
    //    }

    Job.findById(id)
        .populate('user', 'displayName')
        .populate('location')
        .exec(function(err, job) {
            if (err) return next(err);
            if (!job) return next(new Error('Failed to load Job ' + id));
            req.job = job;
            next();
        });
};

/**
 * Job authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
    if (req.job.user.id !== req.user.id) {
        return res.send(403, 'User is not authorized');
    }
    next();
};
