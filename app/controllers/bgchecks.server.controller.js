'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Bgcheck = mongoose.model('Bgcheck'),
    unirest = require('unirest'),
    _ = require('lodash');

// Config
var api_base_url = 'https://renovo-api-test.everifile.com/renovo';
var username = 'api@dswheels.com';
var password = 'Test#123';

var CookieJar;

var login_unirest = function(req, res) {

    if (!!CookieJar) {
        console.log('CookieJar already Initialized');
        return res.status(200).send({
            message: 'Session already initialized'
        });
    }

    // Initaalize new Cookie Jar
    CookieJar = unirest.jar(true);

    // Init username/password post data
    var post_data = {
        'username': username,
        'password': password
    };

    // post login request to get new session;
    unirest.post(api_base_url + '/rest/session')
        .type('json')
        .send(post_data)
        .jar(CookieJar)
        .end(function(response) {
            console.log(response.body);

            debugger;

            if (response.error) {
                CookieJar = null;

                return res.status(400).send({
                    message: response.error.message,
                    reason: response.body ? JSON.parse(response.body).reason : response.error.code
                });
            }

            res.jsonp(response.body);
        });
};

var getApplicants_unirest = function(req, res) {

    if (!CookieJar) {
        console.log('CookieJar is not Initialized');
        return res.status(400).send({
            message: 'No session currently available'
        });
    }
    unirest.get(api_base_url + '/rest/applicant')
        .jar(CookieJar)
        .end(function(response) {
            console.log(response.body);

            if (response.error) {
                return res.status(400).send({
                    message: response.error.message,
                    reason: JSON.parse(response.body).reason
                });
            }

            res.jsonp(response.body);
        });
};

var getApplicant_unirest = function(req, res, next, id) {

    if (!CookieJar) {
        console.log('CookieJar is not Initialized');
        return res.status(400).send({
            message: 'No session currently available'
        });
    }

    unirest.get(api_base_url + '/rest/applicant/' + id)
        .jar(CookieJar)
        .end(function(response) {
            debugger;
            console.log(response.body);

            if (response.error) {
                return res.status(400).send({
                    message: response.error.message,
                    reason: JSON.parse(response.body).reason
                });
            }

            req.applicant = response.body;
            next();
        });
};

var logout_unirest = function(req, res) {

    if (!CookieJar) {
        console.log('CookieJar is not Initialized');
        return res.status(200).send({
            message: 'Session already terminated'
        });
    }

    unirest.delete(api_base_url + '/rest/session')
        .jar(CookieJar)
        .end(function(response) {
            debugger;
            console.log(response.body);

            CookieJar = null;

            if (response.error) {
                return res.status(400).send({
                    message: response.error.message,
                    reason: JSON.parse(response.body).reason
                });
            }

            res.jsonp(response.body);
        });
};

exports.login = function(req, res) {
    console.log('[bgchecks.login]');
    return login_unirest(req, res);
};

exports.getAllApplicants = function(req, res) {
    console.log('[bgchecks.getAllApplicants]');
    return getApplicants_unirest(req, res);
};

exports.getApplicant = function(req, res, next, _id) {
    console.log('[bgchecks.getApplicant]');
    var id = _id || req.query.applicantId || 54;

    return getApplicant_unirest(req, res, next, id);
};

exports.getAvailableReports = function(req, res) {

    if (!CookieJar) {
        console.log('CookieJar is not Initialized');
        return res.status(400).send({
            message: 'No session currently available'
        });
    }

    console.log('[bgchecks.getAvailableReports]');
    unirest.get(api_base_url + '/rest/report')
        .jar(CookieJar)
        .end(function(response) {
            debugger;
            console.log(response.body);

            if (response.error) {
                return res.status(400).send({
                    message: response.error.message,
                    reason: JSON.parse(response.body).reason
                });
            }

            res.jsonp(response.body);
        });
};

exports.runReport = function(req, res, next) {

    if (!CookieJar) {
        console.log('CookieJar is not Initialized');
        return res.status(400).send({
            message: 'No session currently available'
        });
    }

    console.log('[bgchecks.runReport]');
    var type = req.params.reportType || 'OFAC';
    var id = req.applicant ? req.applicant.applicantId : null || req.params.applicantId || req.query.applicantId || 54;

    unirest.post(api_base_url + '/rest/report')
        .jar(CookieJar)
        .query({
            reportSku: type,
            applicantId: id
        })
        .end(function(response) {
            debugger;
            console.log(response.body);
            console.log(response.error);

            if (response.error) {
                return res.status(400).send({
                    message: response.error.message,
                    reason: JSON.parse(response.body).reason
                });
            }

            res.jsonp(response.body);
        });
};

exports.getReport = function(req, res) {

    if (!CookieJar) {
        console.log('CookieJar is not Initialized');
        return res.status(400).send({
            message: 'No session currently available'
        });
    }

    console.log('[bgchecks.getReport]');

    var id = req.reportCheck.id;

    unirest.get(api_base_url + '/rest/reportCheck/' + id + '/report')
        .jar(CookieJar)
        .end(function(response) {
            debugger;
            console.log(response.body);

            if (response.error) {
                return res.status(400).send({
                    message: response.error.message,
                    reason: JSON.parse(response.body).reason
                });
            }

            res.jsonp(response.body);
        });
};

exports.getPdfReport = function(req, res) {

    if (!CookieJar) {
        console.log('CookieJar is not Initialized');
        return res.status(400).send({
            message: 'No session currently available'
        });
    }

    console.log('[bgchecks.getPdfReport]');

    var id = req.reportCheck.id;

    unirest.get(api_base_url + '/rest/reportCheck/' + id + '/report/pdf')
        .jar(CookieJar)
        .end(function(response) {
            debugger;
            console.log(response.body);

            if (response.error) {
                return res.status(400).send({
                    message: response.error.message,
                    reason: JSON.parse(response.body).reason
                });
            }

            res.set('Content-Type', 'application/pdf');

            res.jsonp(response.body);
        });
};

exports.checkReportStatus = function(req, res, next, id) {

    if (!CookieJar) {
        console.log('CookieJar is not Initialized');
        return res.status(400).send({
            message: 'No session currently available'
        });
    }

    unirest.get(api_base_url + '/rest/reportCheck/' + id)
        .jar(CookieJar)
        .end(function(response) {
            debugger;
            console.log(response.body);

            if (response.error) {
                return res.status(400).send({
                    message: response.error.message,
                    reason: JSON.parse(response.body).reason
                });
            }

            var reportCheck = response.body.reportCheckStatus;

            if (reportCheck.status.toUpperCase() === 'COMPLETED') {
                req.reportCheck = response.body;
                next();
            } else {
                res.jsonp(reportCheck);
            }
        });
};

exports.logout = function(req, res) {
    return logout_unirest(req, res);
};

/**
 * Create a Bgcheck
 */
exports.create = function(req, res) {
    var bgcheck = new Bgcheck(req.body);
    bgcheck.user = req.user;

    bgcheck.save(function(err) {
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
exports.read = function(req, res) {
    debugger;
    res.jsonp(req.bgcheck);
};

exports.readApplicant = function(req, res) {
    res.jsonp(req.applicant);
};

/**
 * Update a Bgcheck
 */
exports.update = function(req, res) {
    var bgcheck = req.bgcheck;

    bgcheck = _.extend(bgcheck, req.body);

    bgcheck.save(function(err) {
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
exports.delete = function(req, res) {
    var bgcheck = req.bgcheck;

    bgcheck.remove(function(err) {
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
 * List of Bgchecks
 */
exports.list = function(req, res) {
    Bgcheck.find().sort('-created').populate('user', 'displayName').exec(function(err, bgchecks) {
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
 * Bgcheck middleware
 */
exports.bgcheckByID = function(req, res, next, id) {
    Bgcheck.findById(id)
        .populate('user', 'displayName')
        .exec(function(err, bgcheck) {
            if (err) return next(err);
            if (!bgcheck) return next(new Error('Failed to load Bgcheck ' + id));
            req.bgcheck = bgcheck;
            next();
        });
};

/**
 * Bgcheck authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
    if (req.bgcheck.user.id !== req.user.id) {
        return res.status(403).send('User is not authorized');
    }
    next();
};
