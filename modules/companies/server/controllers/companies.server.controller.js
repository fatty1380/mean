'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('../../../../modules/core/server/controllers/errors.server.controller'),

    Company = mongoose.model('Company'),
    _ = require('lodash');

/**
 * "Instance" Methods
 */

var executeQuery = function(req, res) {

    var query = req.query || {};
    var sort = req.sort || '';

    Company.find(query)
        .sort(sort)
        .populate('owner', 'displayName')
        .exec(function(err, companies) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }

            req.companies = companies || [];
            console.log('[CompaniesCtrl.executeQuery] Found %d companies for query %o', req.companies.length, query);
            res.json(req.companies);
        });
};

/**
 * Create a Company
 */
exports.create = function(req, res) {
    var company = new Company(req.body);
    company.owner = req.user;
    company.agents = [];

    company.save(function(err) {
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
exports.read = function(req, res) {
    res.json(req.company);
};

/**
 * Update a Company
 */
exports.update = function(req, res) {
    var company = req.company;

    company = _.extend(company, req.body);

    company.save(function(err) {
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
 * Delete an Company
 */
exports.delete = function(req, res) {
    var company = req.company;

    company.remove(function(err) {
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
exports.list = function(req, res) {
    req.sort = '-created';

    executeQuery(req, res);
};

exports.listDrivers = function(req, res) {
    console.log('NOT IMPLEMENTED');

    res.json([{
        error: 'NOT IMPLEMENTED',
        about: 'THIS METHOD IS NOT IMPLEMENTED'
    }]);
};

exports.companyByUserID = function(req, res) {

    req.query = {
        owner: req.params.userId
    };

    executeQuery(req, res);
};

/**
 * Company middleware
 */
exports.companyByID = function(req, res, next, id) {
    if (!req.originalUrl.endsWith(id)) {
        next();
        return;
    }
    Company
        .findById(id)
        .populate('owner', 'displayName')
        .exec(function(err, company) {
            if (err) return next(err);
            if (!company) return next(new Error('Failed to load Company ' + id));
            req.company = company;
            next();
        });
};

/**
 * Company authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
    if (req.company.owner.id !== req.user.id) {
        return res.status(403).send('User is not authorized');
    }
    next();
};
