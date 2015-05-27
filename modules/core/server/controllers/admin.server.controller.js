'use strict';

var mongoose = require('mongoose'),
    _ = require('lodash'),
    path = require('path'),
    moment = require('moment'),
    Job = mongoose.model('Job');

exports.updateJobPostDate = function(jobId, numDays) {

    // calculate date between now and last 10 days
    numDays = numDays || 1;
    console.log('Randomizing within that past %d days', numDays);
    var newDate = moment().subtract(Math.random() * numDays * 24, 'h').hour(Math.floor(Math.random() * (20 - 7)) + 7).toDate();

    Job.findOneAndUpdate(
        {_id: jobId},
        {posted: newDate},
        {safe: true, upsert: false, new: true},
        function(err, newJob) {
            if(err) {
                console.log('error updating job: %j', err);
            } else {
                console.log('[Admin.updateJobPostDate] Updated job %s to `%s`', newJob.id, newJob.posted);
            }
        }
    );

    return newDate;
};

exports.refreshJobs = function(req, res) {

    console.log('Query Parameters: %j', req.query);

    var query = {};

    if(!!req.query.cutoffDate) {
        var cutoff = moment(req.query.cutoffDate);

        query.posted = {'$lt': cutoff.toDate()};
    }

    Job.find({}, function(err, jobs) {
       if(err) {
           console.log('[Admin.refreshJobs] Unable to retrieve jobs');
           return res.send(400, {
               message: 'Unable to retrieve jobs',
               error: err
           });
       }

        console.log('[Admin.refreshJobs] Refreshing %d jobs', jobs.length);

        var numDays = req.query.numDays || 1;

        _.forEach(jobs, function(job) {
            job.posted = exports.updateJobPostDate(job.id, numDays);
        });

        res.json(jobs);
    });
};

exports.validateAdmin = function(req, res, next) {
    if(!req.user || !req.user.isAdmin) {
        console.log('Disallowed Access to `%s`', req.url);
        return res.status(404);
    }
    return next();
};
