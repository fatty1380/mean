'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors'),
    Company = mongoose.model('Company'),
    _ = require('lodash');

/**
 * Create a Company
 */
exports.create = function(req, res) {
    var company = new Company(req.body);
    company.user = req.user;

    company.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(company);
        }
    });
};

/**
 * Show the current Company
 */
exports.read = function(req, res) {
    res.jsonp(req.company);
};

exports.readList = function(req, res) {
    res.jsonp(req.companies);
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
            res.jsonp(company);
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
            res.jsonp(company);
        }
    });
};

/**
 * List of Companies
 */
exports.list = function(req, res) {
    Company.find()
        .sort('-created')
        .populate('user', 'displayName')
        .exec(function(err, companies) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.jsonp(companies);
            }
        });
};

exports.listDrivers = function(req, res) {
    debugger;

    console.log('NOT IMPLEMENTED');

    res.jsonp([{error:'NOT IMPLEMENTED', about:'THIS METHOD IS NOT IMPLEMENTED'}]);
};

/**
 * Company middleware
 */
exports.companyByID = function(req, res, next, id) {
    Company.findById(id).populate('user', 'displayName').exec(function(err, company) {
        if (err) return next(err);
        if (!company) return next(new Error('Failed to load Company ' + id));
        req.company = company;
        next();
    });
};

exports.companyByUserID = function(req, res, next, id) {
    debugger; // TODO: Check if middleware mapping is still working
    Company.find({
            user: id
        })
        .exec(function(err, companies) {

            if (err) return next(err);
            if (!companies) return next(new Error('Failed to load companies for userId ' + id));

            console.log('[ApplicationsCtrl.queryByUserId] ' + 'Found %d companies for userId', (companies || []).length, id);

            req.companies = companies || [];
            next();
        });
};

/**
 * Company authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
    if (req.company.user.id !== req.user.id) {
        return res.status(403).send('User is not authorized');
    }
    next();
};
