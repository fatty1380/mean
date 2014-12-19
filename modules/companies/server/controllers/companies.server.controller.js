'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
errorHandler = require('../../../../modules/core/server/controllers/errors.server.controller'),
fs           = require('fs'),

Company      = mongoose.model('Company'),
_            = require('lodash');

/**
 * "Instance" Methods
 */

var executeQuery = function (req, res) {
    console.log('[CompaniesCtrl.executeQuery] Start');


    var query = req.query || {};
    var sort = req.sort || '';

    Company.find(query)
        .sort(sort)
        .populate('owner', 'displayName')
        .exec(function (err, companies) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }

            req.companies = companies || [];
            console.log('[CompaniesCtrl.executeQuery] Found %d companies for query %j', req.companies.length, query);
            res.json(req.companies);
        });
};

/**
 * Create a Company
 */
exports.create = function (req, res) {
    console.log('[CompaniesCtrl.create] Start');

    var company = new Company(req.body);
    company.owner = req.user;
    company.agents = [];

    company.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(company);
        }
    });
};

/**
 * Show the current Company
 */
exports.read = function (req, res) {
    console.log('[CompaniesCtrl.read] Returning company %j', req.company);

    if (!req.company) {
        return res.status(404).send({
            message: 'No company found'
        });
    }

    res.json(req.company);
};

/**
 * Update a Company
 */
exports.update = function (req, res) {
    console.log('[CompaniesCtrl.update] Start');

    var company = req.company;

    company = _.extend(company, req.body);

    company.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(company);
        }
    });
};


/**
 * Update profile picture
 */
exports.changeProfilePicture = function (req, res) {
    console.log('[CompaniesCtrl.changeProfilePicture] Start');


    console.log('Owner %j vs User %j', req.company.owner, req.user);


    var company = req.company;
    var message = null;

    if (company) {
        fs.writeFile('./modules/companies/client/img/profile/uploads/' + req.files.file.name, req.files.file.buffer, function (uploadError) {
            if (uploadError) {
                console.log('[CompaniesCtrl.changeProfilePicture] Upload Error: %j', uploadError);
                return res.status(400).send({
                    message: 'Error occurred while uploading profile picture'
                });
            } else {
                company.profileImageURL = 'modules/companies/img/profile/uploads/' + req.files.file.name;

                company.save(function (saveError) {
                    if (saveError) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(saveError)
                        });
                    } else {
                        req.login(company, function (err) {
                            if (err) {
                                res.status(400).send(err);
                            } else {
                                console.log('[CompaniesCtrl.changeProfilePicture] Success! %j', company);

                                res.json(company);
                            }
                        });
                    }
                });
            }
        });
    } else {
        res.status(400).send({
            message: 'User is not signed in'
        });
    }
};

/**
 * Delete an Company
 */
exports.delete = function (req, res) {
    console.log('[CompaniesCtrl.delete] Start');

    var company = req.company;

    company.remove(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(company);
        }
    });
};

/**
 * List of Companies
 */
exports.list = function (req, res) {
    console.log('[CompaniesCtrl.list] Start');

    req.sort = '-created';

    executeQuery(req, res);
};

exports.listDrivers = function (req, res) {
    console.log('[CompaniesCtrl.listDrivers] Start');

    console.log('NOT IMPLEMENTED');

    res.json([{
        error: 'NOT IMPLEMENTED',
        about: 'THIS METHOD IS NOT IMPLEMENTED'
    }]);
};

exports.companiesByUserID = function (req, res) {
    console.log('[CompaniesCtrl.companiesByUserID] Start');


    req.query = {
        owner: req.params.userId
    };

    executeQuery(req, res);
};

exports.companyByUserID = function (req, res, next) {
    console.log('[CompaniesCtrl.companyByUserID] Start');


    req.query = {
        owner: req.params.userId
    };

    Company.findOne(req.query)
        .populate('owner', 'displayName')
        .exec(function (err, company) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                console.log('[Company.findOne] setting req.company = %j', company);
                req.company = company;
                //res.json(company);

                return next();
            }
        });
};

/**
 * Company middleware
 */
exports.companyByID = function (req, res, next, id) {
    console.log('Querying for company with id %s', id);

    Company
        .findById(id)
        .populate('owner', 'displayName')
        .exec(function (err, company) {
            if (err) {
                return next(err);
            }

            req.company = company;
            next();
        });
};

/**
 * Company authorization middleware
 */
exports.hasAuthorization = function (req, res, next) {
    console.log('[CompaniesCtrl.hasAuthorization] Start');

    if (req.company.owner.id !== req.user.id) {
        console.log('Owner != User :(: %j vs %j', req.company.owner, req.user);
        return res.status(403).send('User is not authorized');
    }
    next();
};
