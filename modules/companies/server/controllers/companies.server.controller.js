'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
errorHandler = require('../../../../modules/core/server/controllers/errors.server.controller'),
fs           = require('fs'),
path         = require('path'),
fileUploader = require(path.resolve('./modules/core/server/controllers/s3FileUpload.server.controller')),
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

    var company = new Company(req.body);
    var ownerId = req.body.ownerId || req.user._id;

    console.log('Creating company for owner: [%s]: %s', ownerId, company._id);

    company.owner = mongoose.Types.ObjectId(ownerId);
    company.agents = [];

    console.log('now saving company w owner [%s], %s', company.owner, company._id);


    company.save(function (err) {
        if (err) {
            console.log('Saving company failed with error: %j', err);
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err),
                error: err
            });
        } else {
            console.log('Successfully saved company: %s', company._id);
            res.json(company);
        }
    });
};

/**
 * Show the current Company
 */
exports.read = function (req, res) {

    if (!req.company) {
        console.log('[CompaniesCtrl.read] No Company available in request');
        return res.status(404).send({
            message: 'No company found'
        });
    }

    console.log('[CompaniesCtrl.read] Returning company %s', req.company._id);

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
                message: errorHandler.getErrorMessage(err),
                error: err
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
    var company = req.company;
    var user = req.user;

    if (!user) {
        return res.status(400).send({
            message: 'User is not signed in'
        });
    }

    if (!company) {
        return res.status(400).send({
            message: 'No Available Company Profile'
        });
    }

    console.log('ownerId:`%s` %s `%s`:userId', company.owner._id, (company.owner._id.equals(user._id) ? '==' : '!='), user._id);
    console.log('Company Agents:`%s` %s `%s`:userId', company.agents, (_.contains(company.agents, user) ? '==' : '!='), user._id);

    if (!company.owner._id.equals(user._id) && !_.contains(company.agents, user)) {
        return res.status(400).send({
            message: 'User does not have access to edit this company'
        });
    }

    fileUploader.saveFileToCloud(req.files, 'companies').then(
        function(successURL) {
            console.log('successfully uploaded company profile picture to %s', successURL);

            company.profileImageURL = successURL;

            company.save(function(saveError) {
                if (saveError) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(saveError)
                    });
                }

                console.log('[CompaniesCtrl.changeProfilePicture] Success! %j', company);

                res.json(company);

            });

        }, function(error) {
            return res.status(400).send({
                message: 'Unable to save Company Profile Picture. Please try again later'
            });
        }
    );
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
            } else if(!!company) {
                console.log('[Company.findOne] setting req.company = %s', company._id);
                req.company = company;
                //res.json(company);

                return next();
            } else {
                console.error('[Company.findOne] No company available for user');
                next();
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
