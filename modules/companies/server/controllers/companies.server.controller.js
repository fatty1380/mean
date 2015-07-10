'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
fs           = require('fs'),
Q            = require('q'),
path         = require('path'),
errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
fileUploader = require(path.resolve('./modules/core/server/controllers/s3FileUpload.server.controller')),
constants    = require(path.resolve('./modules/core/server/models/outset.constants')),
Company      = mongoose.model('Company'),
Subscription = mongoose.model('Subscription'),
Gateway = mongoose.model('Gateway'),
_            = require('lodash'),
log          = require(path.resolve('./config/lib/logger')).child({
    src : { file: 'companies.server.controller', module: 'companies'}
});

/**
 * "Instance" Methods
 */

var executeQuery = function (req, res) {
    req.log.debug('START', {req: req, reqId: req.id, src: {func: 'executeQuery'}});
    req.log.debug({msg: 'START', req: req, reqId: req.id, src: {func: 'executeQuery'}});


    var query = req.query || {};
    var sort = req.sort || '';

    Company.find(query)
        .sort(sort)
        .populate('owner', 'displayName')
        .populate('subscription')
        .exec(function (err, companies) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }

            req.companies = companies || [];
            req.log.debug('[CompaniesCtrl.executeQuery] Found %d companies for query %j', req.companies.length, query);
            res.json(req.companies);
        });
};

/**
 * Create a Company
 */
exports.create = function (req, res) {

    var company = new Company(req.body);
    var ownerId = req.body.ownerId || req.user._id;

    req.log.debug('create', 'Creating company for owner: [%s]: %s', ownerId, company._id);

    company.owner = mongoose.Types.ObjectId(ownerId);
    company.agents = [];

    req.log.debug('create', 'now saving company w owner [%s], %s', company.owner, company._id);


    company.save(function (err) {
        if (err) {
            req.log.error('create', 'Saving company failed with error: %j', err);
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err),
                error: err
            });
        } else {
            req.log.debug('create', 'Successfully saved company: %s', company._id);
            res.json(company);
        }
    });
};

/**
 * Show the current Company
 */
exports.read = function (req, res) {
    req.log.debug({req: req, msg: 'START', src: {func: 'read'}});

    if (!req.company) {
        req.log.debug('[CompaniesCtrl.read] No Company available in request');
        return res.status(404).send({
            message: 'No company found'
        });
    }

    req.log.debug('[CompaniesCtrl.read] Returning company %s', req.company._id);

    res.json(req.company);
};

/**
 * Update a Company
 */
exports.update = function (req, res) {
    req.log.debug('[CompaniesCtrl.update] Start');

    var company = req.company;

    req.log.debug('update', 'Updating company from body', {body: req.body});

    company = _.extend(company, req.body);
    company.locations = req.body.locations || [];

    //company.gateway = company.gateway || new Gateway();

    //_.extend(company.gateway, req.body.gateway);
    //
    //req.log.debug('update', 'saving gateway:', {gateway: company.gateway});

    //company.gateway.save()
    //    .then(function (gateway) {
    //        company.gateway = gateway;
    //
    //        req.log.debug('update', 'now saving company:', {company: company});
    //
    //        return company.save();
    //    },
    //    function (err) {
    //        req.log.error('update', 'Error saving Gateway ... oh well. Trying to recover', err);
    //
    //        return company.save();
    //    })
        company.save()
        .then(function (company) {
            req.log.debug('update', 'Successfully updated Company', {company: company});
            res.json(company);
        },
        function (err) {
            req.log.error('update', 'Error saving Company', err);
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err),
                error: err
            });
        });
};


/**
 * Update profile picture
 */
exports.changeProfilePicture = function (req, res) {
    req.log.debug('[CompaniesCtrl.changeProfilePicture] Start');
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

    req.log.debug('ownerId:`%s` %s `%s`:userId', company.owner._id, (company.owner._id.equals(user._id) ? '==' : '!='), user._id);
    req.log.debug('Company Agents:`%s` %s `%s`:userId', company.agents, (_.contains(company.agents, user) ? '==' : '!='), user._id);

    if (!company.owner._id.equals(user._id) && !_.contains(company.agents, user)) {
        return res.status(400).send({
            message: 'User does not have access to edit this company'
        });
    }

    fileUploader.saveFileToCloud(req.files, 'companies').then(
        function (successURL) {
            req.log.debug('successfully uploaded company profile picture to %s', successURL);

            req.company.profileImageURL = successURL;

            return exports.update(req, res);

        }, function (error) {
            req.log.error('changeProfilePicture', 'Failed to save file to cloud', {error: error});
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
    req.log.debug('[CompaniesCtrl.delete] Start');

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
    req.log.debug('[CompaniesCtrl.list] Start');

    req.sort = '-created';

    executeQuery(req, res);
};

exports.listDrivers = function (req, res) {
    req.log.debug('[CompaniesCtrl.listDrivers] Start');

    req.log.debug('NOT IMPLEMENTED');

    res.json([{
        error: 'NOT IMPLEMENTED',
        about: 'THIS METHOD IS NOT IMPLEMENTED'
    }]);
};

exports.companiesByUserID = function (req, res) {
    req.log.debug({func: 'companiesByUserID'}, 'Start');


    req.query = {
        owner: req.params.userId
    };

    req.log.debug({func: 'companiesByUserID', query: req.query}, 'Searching for companies based on parameterId');

    executeQuery(req, res);
};

exports.companyByUserID = function (req, res, next) {

    req.log.debug({func: 'companyByUserID', params: req.params}, 'Start');


    req.query = {
        owner: req.params.userId
    };

    Company.findOne(req.query)
        .populate('owner', 'displayName')
        .populate('subscription')
        .exec(function (err, company) {
            if (err) {
                req.log.error({error: err, query: req.query, func: 'companyByUserId'}, 'Error Querying for company');
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else if (!!company) {
                req.log.debug({func: 'companyByUserId', companyId: company.id}, 'Found Company for id:%s', company._id);
                req.company = company;
                //res.json(company);

                return next();
            } else {
                req.log.info({func: 'companyByUserId'}, 'No company available for user');
                next();
            }
        });
};

/**
 * Company middleware
 */
exports.companyByID = function (req, res, next, id) {
    if (/([0-9a-f]{24})$/i.test(id)) {
        req.log.debug({companyId: id}, 'Querying for company with id %s', id);

        Company
            .findById(id)
            .populate('owner', 'displayName')
            .populate('subscription')
            //.populate('gateway')
            .exec(function (err, company) {
                if (err) {
                    req.log.error(err, 'companyById', 'Unable to find company');
                    return next(err);
                }

                //if(!_.isEmpty(company.gateway)){
                //    if(company.gateway instanceof mongoose.Schema.ObjectId) {
                //        debugger;
                //        company.populate('gateway');
                //    }
                //    else if (!company.gateway instanceof Gateway) {
                //        debugger;
                //        company.gateway = new Gateway(company.gateway);
                //    }
                //}

                req.log.trace({company: company}, 'Found company: %s', company && company.id);
                req.company = company;
                next();
            });
    } else {
        req.log.trace({companyId: id}, '`%s` is not a valid companyId', id);
        next();
    }
};

/**
 * Company authorization middleware
 */
exports.hasAuthorization = function (req, res, next) {
    req.log.trace('hasAuthorization', 'Start', {company: req.company, user: req.user});
    req.log.debug('hasAuthorization', 'Start', {company: req.company.owner._id, user: req.user._id});

    if (req.user.equals(req.company.owner)) {
        next();
    }
    else if (req.user.isAdmin) {
        req.log.info({company: {id: req.company.id, user: req.user._id}}, 'COmpany being edited by admin `%s`', req.user.username);
        next();
    }
    else {
        req.log.debug({company: {id: req.company.id, owner: req.company.owner}}, 'Owner != User :(: %j vs %j', req.company.owner, req.user);
        return res.status(403).send('User is not authorized');
    }
};


/**
 * Subscription Logic
 */
exports.getSubscription = function (req, res) {
    if (!req.company) {
        var msg = 'No Company found for id `' + req.companyId + '`';
        req.log.info({companyId: req.companyId}, msg);
        return res.status(404).send(msg);
    }

    var subscription = req.company.subscription;

    if (!!subscription && subscription instanceof mongoose.Types.ObjectId) {
        Subscription.findById(subscription.id)
            .exec(function (err, subscription) {
                if (err) {
                    var msg = errorHandler.getErrorMessage(err);
                    req.log.error(err, 'Failed to load subscription due to `%s`', msg);
                    return res.status(401).send({message: msg});
                }

                req.log.trace({subcription: subscription}, 'Returning Subscription %s', subscription.id);
                return res.json(subscription);
            });
    } else {
        return res.json(subscription);
    }
};

exports.createSubscription = function (req, res, next) {

    if (!req.company) {
        var msg = 'No Company found for id `' + req.companyId + '`';
        req.log.info({companyId: req.companyId}, msg);
        return res.status(400).send(msg);
    }

    /**
     * Query Parameters - Possible
     * ---------------------------
     * planId: The Braintree planId specified in the order
     * promoCode: The Braintree promo-code
     * nonce: The Braintree payment nonce used to transfer payment info securely
     * price: The price shown on the client, for verification
     * companyId: The company ordering the subscription
     */

    req.planId = req.query.planId;
    req.promoCode = req.query.promoCode;
    req.price = req.query.price;


    req.log.debug('[CreateSubscription] Looking up subscription for planId: %s', req.planId);
    req.subscriptionType = _.find(constants.subscriptionPackages.packages, {'planId': req.planId});

    next();
};

exports.saveSubscription = function (req, res) {
    if (!!req.paymentResult && req.paymentResult.success) {

        var subscription = req.paymentResult.subscription;

        var sub = new Subscription({
            name: req.planDetails.name,
            sku: req.planDetails.id,
            used: 0,
            available: req.subscriptionType.jobCt,
            renews: new Date(subscription.billingPeriodEndDate),
            status: subscription.status.toLowerCase(),
            remoteSubscriptionId: subscription.id,
            company: req.company
        });

        req.log.debug('[CompanySubscription] Creating new subscription: %j', sub);

        sub.save(function (err, newSub) {
            if (err) {
                req.log.debug('[CompanySubscription.sub] error saving subscription information: ', err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err),
                    error: err
                });
            }

            req.log.debug('[Subscription] Successfully saved subscription with id `%s`!', newSub.id);

            req.log.debug('[CompanySubscription] Saving sub to company `%s`: %j', req.company.id, req.company);

            Company.findOneAndUpdate({_id: req.company.id}, {'subscription': newSub._id}, {new: true}, function (err, updatedCo) {
                if (err) {
                    req.log.debug('[CompanySubscription.co] error saving subscription information: ', err);
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err),
                        error: err
                    });
                } else {
                    req.log.debug('[CompanySubscription.co] Successfully created subscription to company `%s`!', updatedCo.id);
                    res.json(sub);
                }
            });
        });
    } else {
        res.status(400).send({
            message: 'Unable to create subscription on server',
            serverData: req.paymentResult
        });
    }
};

