'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
path         = require('path'),
Driver       = mongoose.model('Driver'),
License      = mongoose.model('License'),
Schedule     = mongoose.model('Schedule'),
constants    = require(path.resolve('./modules/core/server/models/outset.constants')),
errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
fileUploader = require(path.resolve('./modules/core/server/controllers/s3FileUpload.server.controller')),
moment       = require('moment'),
_            = require('lodash');



exports.create = create;
exports.read = read;
exports.update = update;
exports.uploadResume = uploadResume;
exports.refreshResume = refreshResume;
exports.refreshReport = refreshReport;
exports.getProfileFormAnswers = getProfileFormAnswers;
exports.createProfileFormAnswers = createProfileFormAnswers;
exports.updateProfileFormAnswers = updateProfileFormAnswers;
exports.delete = deleteDriver;
exports.list = list;
exports.driverByUserID = driverByUserID;
exports.me = me;
exports.driverByID = driverByID;
exports.hasAuthorization = hasAuthorization;


//////////////////////////////////////////////////////////
/**
 * Create a Driver
 */
function create(req, res) {
    debugger;
    var driver = new Driver(req.body);
    driver.user = req.user;
    driver.licenses = req.body.licenses;

    if (driver.licenses[0] && driver.licenses[0].type !== 'Commercial') {
        driver.licenses[0].rating = null;
    }

    // Schedule is disabled
    if (false) {
        if (_.isUndefined(driver.schedule)) {
            driver.schedule = [];
        }

        if (driver.schedule.length === 0) {
            _.forEach(constants.baseSchedule, function (val, key) {
                driver.schedule.push(new Schedule(val));
            });
        }
    } else {
        driver.schedule = null;
    }

    console.log('[Driver Create] %j', driver);

    driver.save(function (err) {
        if (err) {
            return res.send(400, {
                message: getErrorMessage(err)
            });
        } else {
            res.json(driver);
        }
    });
}

/**
 * Show the current Driver
 */
function read(req, res) {
    console.log('[Driver.read] Req.driver has value: %s', !!req.driver);

    if (!req.driver) {
        return res.status(404).send({
            message: 'No driver found'
        });
    }

    res.json(req.driver);
}

/**
 * Update a Driver
 */
function update(req, res) {
    console.log('[Driver.Controller] update()');
    var driver = req.driver;

    driver = _.extend(driver, req.body);

    if (driver.licenses[0] && driver.licenses[0].type !== 'Commercial') {
        driver.licenses[0].rating = null;
    }

    driver.save(function (err) {
        if (err) {
            console.log('[Driver.Update] Unable to update driver due to error: %j', err);
            return res.send(400, {
                message: 'Unable to save changes at this time. Please try again later',
                error: err.stack
            });
        } else {
            console.log('Driver Saved %s', driver._id);
            res.json(driver);
        }
    });
}

/**
 * Update profile picture
 */
function uploadResume(req, res) {
    console.log('[DriverCtrl.uploadResume] Start');
    var user = req.user;
    var driver = req.driver;
    var sku = req.files.file.sku || 'resume';

    if (!user) {
        return res.status(400).send({
            message: 'User is not signed in'
        });
    }

    if (!driver) {
        return res.status(400).send({
            message: 'No Available Driver Profile'
        });
    }

    req.files.file.name = sku + '.' + req.user.shortName + '.' + req.files.file.extension;

    fileUploader.saveFileToCloud(req.files, 'secure-content', true).then(
        function (response) {
            console.log('successfully uploaded user resume to %j', response);

            if(_.isEmpty(driver.reports[sku])) {
                driver.reportsData.push({ sku: sku });
            }

            _.extend(driver.reports[sku], response, {expires: moment().add(15, 'm').toDate()});

            driver.save(function (saveError) {
                if (saveError) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(saveError)
                    });
                }

                res.json(driver.reports[sku]);

            });

        }, function (error) {
            console.log('Failed to save Resume: %j', error);
            return res.status(400).send({
                message: 'Unable to save Driver Resume. Please try again later'
            });
        }
    );
}

function refreshResume(req, res) {
    console.log('[DriverCtrl.refreshResume] Start');

    req.params.reportSku = 'resume';

    return exports.refreshReport(req,res);
}

function refreshReport(req, res) {

    console.log('[DriverCtrl.refreshReport] Start');
    var user = req.user;
    var driver = req.driver;
    var sku = req.params.reportSku || !!driver.reportsData && driver.reportsData.length && driver.reportsData[0].sku;
    var report = !!sku && !!driver ? driver.reports[sku] : null;

    if (!user) {
        console.log('[DriverCtrl.refreshReport] User is not signed in');
        return res.status(401).send({
            message: 'User is not signed in'
        });
    }

    if (!driver) {
        console.log('[DriverCtrl.refreshReport] No Available Driver Profile');
        return res.status(400).send({
            message: 'No Available Driver Profile'
        });
    }

    if (!sku || !(report && report.bucket && report.key)) {
        console.log('[DriverCtrl.refreshReport] Driver does not have a %s on file', sku);
        return res.status(404).send({
            message: 'Driver does not have a ' + sku + ' report on file'
        });
    }

    if(moment().isBefore(report.expires)) {
        console.log('[DriverCtrl.refreshReport] Report has not yet expired ==================================================================================================');
        return res.json(report);
    }

    fileUploader.getSecureReadURL(report.bucket, report.key).then(
        function (success) {

            report.url = success;
            console.log('[DriverCtrl.refreshReport] Post secure upload, resolving with : %j', report);

            res.json(report);

            driver.updateReportURL(sku, report.url);

            driver.save(function (err, updated) {
                if (err) {
                    console.log('[DriverCtrl.refreshReport] unable to save driver\'s updated report url', err);
                } else {
                    console.log('[DriverCtrl.refreshReport] Saved driver\'s updated report URL');
                }
            });
        }, function (err) {
            console.log('[DriverCtrl.refreshReport] Post secure upload failed: %j', err);

            return res.status(400).send({
                message: 'Unable to retrieve fresh URL for resume'
            });
        });
}

/**
 * Handle the profile forms (eg: DOT Questionnaire
 */
function getProfileFormAnswers(req, res) {
    var list;
    if(!!req.query.formId) {
        console.log('Searching for profile form answers for `%s`', req.query.formId);
        list = _.find(req.driver.profile, {listId: req.query.formId});
    }
    else {
        list = req.driver.profile;
    }

    var indexed = _.indexBy(list, 'listId');

    res.json(indexed);
}
function createProfileFormAnswers(req, res) {
    // TODO: Save Profile form answers without saving the full driver
}
function updateProfileFormAnswers(req, res) {
    // TODO: Save Updated Profile form answers without saving the full driver
}

/**
 * Delete an Driver
 */
function deleteDriver(req, res) {
    var driver = req.driver;

    driver.remove(function (err) {
        if (err) {
            return res.send(400, {
                message: getErrorMessage(err)
            });
        } else {
            res.json(driver);
        }
    });
}

/**
 * List of *ALL* Drivers
 */
function list(req, res) {
    console.log('[Driver.Controller] list(): ', req.url);

    req.sort = '-created';

    executeQuery(req, res);
}


function driverByUserID(req, res, next) {
    console.log('[Driver.driverByUserId] start');
    var userId = req.params.userId || req.query.userId || req.user.id;

    console.log('[Driver.driverByUserId] Looking for Driver for user: ', userId);

    if (!!userId) {
        return executeFind(req, res, next, Driver.findOne({
            user: userId
        }));
    }
}

function me(req, res, next) {
    executeFind(req, res, next, Driver.findOne({
        user: req.user.id
    }));
}

/**
 * Driver middleware
 */
function driverByID(req, res, next, id) {
    console.log('[Driver.driverById] start ');

    if ((/^[a-f\d]{24}$/i).test(id)) {
        return executeFind(req, res, next, Driver.findById(id));
    }

    return res.status(404).send({
        message: 'Unable to find a profile associated with that user'
    });
}

/**
 * Driver authorization middleware
 */
function hasAuthorization(req, res, next) {
    console.log('[Drivers.Ctrl.hasAuthorization] Checking...');
    if (req.driver.user.id !== req.user.id) {
        return res.status(403).send({message: 'User is not authorized'});
    }
    next();
}

////////////////////////////////////////////

/**
 * "Instance" Methods
 */

function executeQuery(req, res, next) {
    var query = req.query || {};
    var sort = req.sort || '';

    Driver.find(query)
        .sort(sort)
        .populate('user', 'displayName created profileImageURL addresses')
        .exec(function (err, drivers) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }

            req.drivers = drivers || [];
            console.log('[DriversCtrl.executeQuery] Found %d drivers for query %j', req.drivers.length, query);
            res.json(req.drivers);
        });
}

// Searches for a single instance of a driver, based on the passed in 'driverFind' function;

function executeFind(req, res, next, driverFind) {
    driverFind
        .populate('user')
        .exec(function (err, driver) {
            if (err) {
                console.log('[Driver.executeFind] Driver search errored: ', err.message);
                if (!!next) {
                    return next(err);
                }

                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }

            if (!driver) {
                console.log('[Driver.executeFind] No Driver Found');

                if (!!next) {
                    return next();
                }


            } else {
                console.log('[Driver.executeFind] found driver: %s', driver.id);
            }

            driver.user.cleanse();

            if (!!next) {
                req.driver = driver;
                next();
            } else {
                res.json(driver);
            }
        });
}

/**
 * Get the error message from error object
 */
function getErrorMessage(err) {
    var message = '';

    if (err.code) {
        switch (err.code) {
            case 11000:
            case 11001:
                message = 'Driver already exists';
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
}