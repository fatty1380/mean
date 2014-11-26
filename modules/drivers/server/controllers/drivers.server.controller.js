'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Driver = mongoose.model('Driver'),
    License = mongoose.model('License'),
    errorHandler = require('../../../../modules/core/server/controllers/errors.server.controller'),
    _ = require('lodash');

/**
 * "Instance" Methods
 */

var executeQuery = function(req, res, next) {
    var query = req.query || {};
    var sort = req.sort || '';

    Driver.find(query)
        .sort(sort)
        .populate('user', 'displayName')
        .exec(function(err, drivers) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }

            req.drivers = drivers || [];
            console.log('[DriversCtrl.executeQuery] Found %d drivers for query %j', req.drivers.length, query);
            res.json(req.drivers);
        });
};

// Searches for a single instance of a driver, based on the passed in 'driverFind' function;

var executeFind = function(req, res, next, driverFind) {
    driverFind
        .populate('user')
        .exec(function(err, driver) {
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
                console.log('[Driver.executeFind] found driver: ', driver);
            }

            if (!!next) {
                req.driver = driver;
                next();
            } else {
                res.json(driver);
            }
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
                message = 'Driver already exists';
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
 * Create a Driver
 */
exports.create = function(req, res) {
    var driver = new Driver(req.body);
    driver.user = req.user;

    driver.save(function(err) {
        if (err) {
            return res.send(400, {
                message: getErrorMessage(err)
            });
        } else {
            res.json(driver);
        }
    });
};

/**
 * Show the current Driver
 */
exports.read = function(req, res) {
    console.log('[Driver.read] Result: ', req.driver);

    if (!req.driver) {
        return res.status(404).send({
            message: 'No driver found'
        });
    }

    res.json(req.driver);
};

/**
 * Update a Driver
 */
exports.update = function(req, res) {
    console.log('[Driver.Controller] update()');
    var driver = req.driver;

    driver = _.extend(driver, req.body);

    driver.save(function(err) {
        if (err) {
            return res.send(400, {
                message: getErrorMessage(err)
            });
        } else {
            res.json(driver);
        }
    });
};

exports.licenseStuff = function(req, res) {

    if (req.licenses.length === 0) {
        console.log('No licenses in current user model');
    }

    var licenses = req.body.licenses;

    console.log('request has ' + licenses.length + ' license(s).');
    console.log('req user has ' + req.user.licenses.length + ' license(s).');

    if (licenses.length > 0) {
        var license = new License(licenses[0]);

        // TODO: Add dirty check: https://github.com/LearnBoost/mongoose/issues/1814
        license.updated = Date.now();

        license.save(function(err, doc) {
            if (err) {
                console.log('error saving license');
                console.log(err);
            } else {
                console.log('license saved successfully');

                //user.licenses.push(doc._id);

                //console.log('User License Count: ' + user.licenses.length);
            }
        });
    }
};

/**
 * Delete an Driver
 */
exports.delete = function(req, res) {
    var driver = req.driver;

    driver.remove(function(err) {
        if (err) {
            return res.send(400, {
                message: getErrorMessage(err)
            });
        } else {
            res.json(driver);
        }
    });
};

/**
 * Add License
 * TODO: Move to License Controller?
 */
exports.newLicense = function(req, res) {
    // Init Variables
    var user = req.user;
    var message = null;

    // For security measurement we remove the roles from the req.body object
    delete req.body.roles;

    if (user) {

        var license;

        if (user.licenses.length === 0) {
            license = new License(req.body);
        } else {
            res.json(user.licenses[0]);
        }

        var attributeEnums;
        var enumOpts = {};

        for (var attribute in License.schema.paths) {
            attributeEnums = License.schema.path(attribute)
                .options.enum; //License.schema.path(attribute).enumValues ||

            if (attributeEnums !== undefined && attributeEnums.length > 0) {
                console.log(attribute + ': ' + attributeEnums);

                //enumOpts.push({attribute : attributeEnums});
                enumOpts[attribute] = attributeEnums;
            }
        }

        license._doc.enums = enumOpts;

        res.json(license);
    } else {
        res.send(400, {
            message: 'User is not signed in'
        });
    }
};

/**
 * List of *ALL* Drivers
 */
exports.list = function(req, res) {
    console.log('[Driver.Controller] list()');

    req.sort = '-created';

    executeQuery(req, res);
};


exports.driverByUserID = function(req, res, next) {
    console.log('[Driver.driverByUserId] start');
    var userId = req.params.userId || req.query.userId;

    console.log('[Driver.driverByUserId] Looking for Driver for user: ', userId);

    if (!!userId) {
        return executeFind(req, res, next, Driver.findOne({
            user: userId
        }));
    }
    next();
};

exports.me = function(req, res, next) {
    executeFind(req, res, next, Driver.findOne({
        user: req.user.id
    }));
};

/**
 * Driver middleware
 */
exports.driverByID = function(req, res, next, id) {
    console.log('[Driver.driverById] start ');

    if ((/^[a-f\d]{24}$/i).test(id)) {
        return executeFind(req, res, next, Driver.findById(id));
    }

    next();

};

/**
 * Driver authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
    if (req.driver.user.id !== req.user.id) {
        return res.send(403, 'User is not authorized');
    }
    next();
};
