'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
errorHandler = require('../../../core/server/controllers/errors.server.controller'),
Bgcheck      = mongoose.model('Bgcheck'),
everifile    = require('./everifile.server.controller'),
_            = require('lodash');

// Config
var baseUrl = 'https://renovo-api-test.everifile.com/renovo';
var username = 'api@dswheels.com';
var password = 'Test#123';

exports.login = function (req, res) {
    console.log('[bgchecks.login]');
    return everifile.login(req, res);
};

exports.getAllApplicants = function getAllApplicants(req, res) {
    console.log('[bgchecks.getAllApplicants]');
    return everifile.getApplicants(req, res);
};

exports.getApplicant = function getApplicant(req, res, next, _id) {
    console.log('[bgchecks.getApplicant]');
    var id = _id || req.query.applicantId || 54;

    return everifile.getApplicant(req, res, next, id);
};

exports.logout = function (req, res) {
    return everifile.logout(req, res);
};

exports.requestReport = function (req, res) {
    var user = req.user;

    var reportOptions = getReportInfo(user);

    req.reportType = reportOptions.reportType;
    req.applicantId = reportOptions.applicantId;



};

function getReportInfo(user) {
    return {
        applicantId: 54,
        reportType: 'OFAC'
    };
}

/**
 * Create a Bgcheck
 */
exports.create = function (req, res) {
    var bgcheck = new Bgcheck(req.body);
    bgcheck.user = req.user;

    bgcheck.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(bgcheck);
        }
    });
};

/**
 * Show the current Bgcheck
 */
exports.read = function (req, res) {
    if (!req.bgcheck) {
        return res.status(404).send({
            message: 'No BG Check found'
        });
    }

    res.jsonp(req.bgcheck);
};

exports.readApplicant = function (req, res) {

    if (!req.applicant) {
        return res.status(404).send({
            message: 'No applicant found'
        });
    }

    res.jsonp(req.applicant);
};

/**
 * Update a Bgcheck
 */
exports.update = function (req, res) {
    var bgcheck = req.bgcheck;

    bgcheck = _.extend(bgcheck, req.body);

    bgcheck.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(bgcheck);
        }
    });
};

/**
 * Delete an Bgcheck
 */
exports.delete = function (req, res) {
    var bgcheck = req.bgcheck;

    bgcheck.remove(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(bgcheck);
        }
    });
};

exports.list = function (req, res) {
    var query = req.query || {};
    var sort = req.sort || '-created';

    Bgcheck.find(query)
        .sort(sort)
        .populate('user')
        .exec(function (err, bgchecks) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.jsonp(bgchecks);
            }
        });
};

/**
 * List of Bgchecks
 */
exports.listByUser = function (req, res) {

    if (req.params.userId) {
        req.query = {user: req.params.userId};
    }

    debugger;
    this.list(req, res);
};

/**
 * Bgcheck middleware
 */
exports.bgcheckByID = function (req, res, next, id) {
    Bgcheck.findById(id)
        .populate('user', 'displayName')
        .exec(function (err, bgcheck) {
            if (err) {
                return next(err);
            }
            req.bgcheck = bgcheck;
            next();
        });
};

/**
 * Bgcheck authorization middleware
 */
exports.hasAuthorization = function (req, res, next) {
    if (req.bgcheck.user.id === req.user.id) {
        return next();
    }
    else {
        return res.status(403).send('User is not authorized');
    }
};
