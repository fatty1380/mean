'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    path = require('path'),
    constants = require(path.resolve('./modules/core/server/models/outset.constants')),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    fileUploader = require(path.resolve('./modules/core/server/controllers/s3FileUpload.server.controller')),
    moment = require('moment'),
    _ = require('lodash'),
    log = require(path.resolve('./config/lib/logger')).child({
        module: 'drivers',
        file: 'controller'
    });

var props = require('./drivers.properties.server.controller'),
    exp = require('./drivers.experience.server.controller');

var
    Driver = mongoose.model('Driver'),
    License = mongoose.model('License'),
    Schedule = mongoose.model('Schedule');


log.error({ props: _.keys(props) }, 'AVAILABLE PROPERTY FUNCTIONS');

_.extend(exports, {
    create: errorHandler.notAvailable, //create,
    read: read,
    update: update,
    uploadResume: uploadResume,
    refreshResume: refreshResume,
    refreshReport: refreshReport,
    getProfileFormAnswers: getProfileFormAnswers,
    createProfileFormAnswers: createProfileFormAnswers,
    updateProfileFormAnswers: updateProfileFormAnswers,
    delete: deleteDriver,
    list: list,
    driverByUserID: errorHandler.notAvailable,
    driverByID: driverByID,
    hasAuthorization: hasAuthorization,

    setProps: props.setProperties,
    getProps: props.getProperties,

    getExperience: exp.getExperience,
    addExperience: exp.addExperience,
    setExperience: exp.setExperience
});


//////////////////////////////////////////////////////////
/**
 * Create a Driver
 * @deprecated drivers are now a type of user
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

    req.log.debug('[Driver Create] %j', driver);

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
    req.log.debug('[Driver.read] Req.driver has value: %s', !!req.driver);

    if (!req.driver) {
        return res.status(404).send({
            message: 'No driver found'
        });
    }

    res.json(req.driver);
}

/**
 * Update a Driver
 * @migrated: false
 */
function update(req, res) {
    req.log.debug({ module: 'drivers', func: 'update', body: req.body }, 'Start');
    var driver = req.driver;

    driver = _.extend(driver, req.body);

    if (driver.licenses[0] && driver.licenses[0].type !== 'Commercial') {
        driver.licenses[0].rating = null;
    }

    driver.save(function (err) {
        if (err) {
            req.log.debug('[Driver.Update] Unable to update driver due to error: %j', err);
            return res.send(400, {
                message: 'Unable to save changes at this time. Please try again later',
                error: err.stack
            });
        } else {
            req.log.debug('Driver Saved %s', driver._id);
            res.json(driver);
        }
    });
}

/**
 * Update profile picture
 * -----------------------
 * Driver Migration: True
 * This has been updated to handle the new combined user/driver object.
 */
function uploadResume(req, res) {
    req.log.debug('[DriverCtrl.uploadResume] Start');
    var user = req.user;
    var sku = req.files.file.sku || 'resume';

    if (!user) {
        return res.status(400).send({
            message: 'User is not signed in'
        });
    }

    req.files.file.name = sku + '.' + req.user.shortName + '.' + req.files.file.extension;

    fileUploader.saveFileToCloud(req.files, 'secure-content', true).then(
        function (response) {
            req.log.debug('successfully uploaded user resume to %j', response);

            if (_.isEmpty(user.reports[sku])) {
                user.reportsData.push({ sku: sku });
            }

            _.extend(user.reports[sku], response, { expires: moment().add(15, 'm').toDate() });

            user.save(function (saveError) {
                if (saveError) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(saveError)
                    });
                }

                res.json(user.reports[sku]);

            });

        }, function (error) {
            req.log.debug('Failed to save Resume: %j', error);
            return res.status(400).send({
                message: 'Unable to save Driver Resume. Please try again later'
            });
        }
        );
}

function refreshResume(req, res) {
    req.log.debug('[DriverCtrl.refreshResume] Start');

    req.params.reportSku = 'resume';

    return exports.refreshReport(req, res);
}

/**
 * Refresh Report
 * -----------------------
 * Driver Migration: True
 * This has been updated to handle the new combined user/driver object.
 * -----------------------
 * This method returns the URL of a specific reportSKU. If the URL is public, or
 * if it is private and has not expired, it will return that URL. Otherwise, it
 * will make a request to get a new secure signed URL.
 */
function refreshReport(req, res) {

    req.log.debug('[DriverCtrl.refreshReport] Start');
    var user = req.user;
    var sku = req.params.reportSku || !!user.reportsData && user.reportsData.length && user.reportsData[0].sku;
    var report = !!sku && !!user ? user.reports[sku] : null;

    if (!user) {
        req.log.debug('[DriverCtrl.refreshReport] User is not signed in');
        return res.status(401).send({
            message: 'User is not signed in'
        });
    }

    if (!sku || !(report && report.bucket && report.key)) {
        req.log.debug('[DriverCtrl.refreshReport] Driver does not have a %s on file', sku);
        return res.status(404).send({
            message: 'Driver does not have a ' + sku + ' report on file'
        });
    }

    if (moment().isBefore(report.expires)) {
        req.log.debug('[DriverCtrl.refreshReport] Report has not yet expired ==================================================================================================');
        return res.json(report);
    }

    fileUploader.getSecureReadURL(report.bucket, report.key).then(
        function (success) {

            report.url = success;
            req.log.debug('[DriverCtrl.refreshReport] Post secure upload, resolving with : %j', report);

            res.json(report);

            user.updateReportURL(sku, report.url);

            user.save(function (err, updated) {
                if (err) {
                    req.log.debug('[DriverCtrl.refreshReport] unable to save driver\'s updated report url', err);
                } else {
                    req.log.debug('[DriverCtrl.refreshReport] Saved driver\'s updated report URL');
                }
            });
        }, function (err) {
            req.log.debug('[DriverCtrl.refreshReport] Post secure upload failed: %j', err);

            return res.status(400).send({
                message: 'Unable to retrieve fresh URL for resume'
            });
        });
}

/**
 * Handle the profile forms (eg: DOT Questionnaire
 * -----------------------------------------------
 * Driver Migration: False
 * THis has not been updated to handle the new user/driver object
 */
function getProfileFormAnswers(req, res) {
    var list;
    if (!!req.query.formId) {
        req.log.debug('Searching for profile form answers for `%s`', req.query.formId);
        list = _.find(req.driver.profile, { listId: req.query.formId });
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
 * Delete a Driver
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
    req.log.debug('[Driver.Controller] list(): ', req.url);

    req.sort = '-created';

    executeQuery(req, res);
}


// function driverByUserID(req, res, next) {
//     req.log.debug('[Driver.driverByUserId] start');
//     var userId = req.params.userId || req.query.userId || req.user.id;

//     req.log.debug('[Driver.driverByUserId] Looking for Driver for user: ', userId);

//     if (!!userId) {
//         return executeFind(req, res, next, Driver.findOne({
//             _id: userId
//         }));
//     }
// }

/**
 * Driver middleware
 */
function driverByID(req, res, next, id) {
    req.log.debug('[Driver.driverById] start for id: ', id);

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
    req.log.debug('[Drivers.Ctrl.hasAuthorization] Checking...');
    if (req.driver.id !== req.user.id) {
        return res.status(403).send({ message: 'User is not authorized' });
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
        .select(Driver.fields.social)
        .exec(function (err, drivers) {
            if (err) {
                if (!drivers) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                }
            }
            
            // var fields = Driver.fields.social.split(' ');
            // fields.push('id')
            
            // req.drivers = _.map(drivers, function (d) {
            //     d.socialify();
                
            //     return d;
            // })

            req.drivers = drivers || [];
            req.log.debug('[DriversCtrl.executeQuery] Found %d drivers for query %j', req.drivers.length, query);
            res.json(req.drivers);
        });
}

// Searches for a single instance of a driver, based on the passed in 'driverFind' function;

function executeFind(req, res, next, driverFind) {
    driverFind
    //.populate(Driver.fields.social)
        .exec(function (err, driver) {
            if (err) {
                req.log.debug('[Driver.executeFind] Driver search errored: ', err.message);
                if (!!next) {
                    return next(err);
                }

                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }

            if (!driver) {
                req.log.debug('[Driver.executeFind] No Driver Found');

                if (!!next) {
                    return next();
                }


            } else {
                req.log.debug('[Driver.executeFind] found driver: %s', driver.id);
            }

            // TODO: Check social connection and access to fields
            driver.socialify();

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