'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Job = mongoose.model('Job'),
    Address = mongoose.model('Address'),
    _ = require('lodash');

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
                    res.jsonp(job);
                }
            });
        }
    });


};

/**
 * Show the current Job
 */
exports.read = function(req, res) {
    res.jsonp(req.job);
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
                    res.jsonp(job);
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
            res.jsonp(job);
        }
    });
};

/**
 * List of Jobs
 */
exports.list = function(req, res) {
    var query = null;

    if (req.query.userId !== undefined) {
        query = {
            user: req.query.userId
        };
    }

    Job.find(query)
        .sort('-created')
        .populate('user', 'displayName')
        .populate('location')
        .exec(function(err, jobs) {
            if (err) {
                return res.send(400, {
                    message: getErrorMessage(err)
                });
            } else {
                res.jsonp(jobs);
            }
        });
};

/**
 * List of a user's posted jobs
 */
exports.listByUserID = function(req, res, id) {
    Job.find()
        .sort('-created')
        .populate('user', 'displayName', {
            _id: id
        })
        .populate('location')
        .exec(function(err, jobs) {
            if (err) {
                return res.send(400, {
                    message: getErrorMessage(err)
                });
            } else {
                res.jsonp(jobs);
            }
        });
};

/**
 * Apply for a job
 */
exports.apply = function(req, res, id) {
    var job = req.job;

    console.log('TODO: Implement Server-Side Job Application logic');
};



/**
 * Job middleware
 */
exports.jobByID = function(req, res, next, id) {
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
