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
    
var docs = require(path.resolve('./modules/documents/server/controllers/documents.server.controller'));

var
    Driver = mongoose.model('Driver'),
    License = mongoose.model('License'),
    Schedule = mongoose.model('Schedule');

_.extend(exports, {
    create: errorHandler.notAvailable, //create,
    read: read,
    update: update,
    uploadResume: docs.uploadResume,
    refreshResume: docs.refreshResume,
    refreshReport: docs.refreshReport,
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

    experienceById: exp.experienceById,
    addExperience: exp.create,
    getExperience: exp.read,
    setExperience: exp.update,
    removeExperience: exp.remove
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

    if (driver.license && driver.license.type !== 'Commercial') {
        driver.license.rating = null;
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

    if (driver.license && driver.license.type !== 'Commercial') {
        driver.license.rating = null;
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