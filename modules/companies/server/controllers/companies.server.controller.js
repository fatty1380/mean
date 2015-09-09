'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Q = require('q'),
    path = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    fileUploader = require(path.resolve('./modules/core/server/controllers/s3FileUpload.server.controller')),
    constants = require(path.resolve('./modules/core/server/models/outset.constants')),
    Company = mongoose.model('Company'),
    Gateway = mongoose.model('Gateway'),
    _ = require('lodash'),
    log = require(path.resolve('./config/lib/logger')).child({
        src: { file: 'companies.server.controller', module: 'companies' }
    });

var subs = require('./subscriptions.server.controller');

exports.create = create; 
exports.read = read; 
exports.update = update; 
exports.changeProfilePicture = changeProfilePicture; 
exports.delete = deleteCompany; 
exports.list = list; 
exports.listDrivers = listDrivers; 
exports.companiesByUserID = companiesByUserID; 
exports.companyByUserID = companyByUserID; 
exports.companyByID = companyByID; 
exports.hasAuthorization = hasAuthorization; 
exports.follow = follow;
exports.unfollow = unfollow;

/**
 * Subscription Logic
 * The Subscriptions Module exports the following 3 methods:
 * 
 *     - getSubscription;
 *     - createSubscription;
 *     - saveSubscription; 
 * 
 * which are added to this module via the extension of the 'exports' object
 */
_.extend(exports, subs);

/**
 * "Instance" Methods
 */

var executeQuery = function (req, res) {
    req.log.debug('START', { req: req, reqId: req.id, src: { func: 'executeQuery' } });
    req.log.debug({ msg: 'START', req: req, reqId: req.id, src: { func: 'executeQuery' } });


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
function create (req, res) {

    var company = new Company(req.body);
    var ownerId = req.body.ownerId || req.user._id;

    req.log.debug('create', 'Creating company for owner: [%s]: %s', ownerId, company._id);

    company.owner = new mongoose.Types.ObjectId(ownerId);
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
function read (req, res) {
    req.log.debug({ req: req, msg: 'START', src: { func: 'read' } });

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
function update (req, res) {
    req.log.debug('[CompaniesCtrl.update] Start');

    var company = req.company;

    req.log.debug('update', 'Updating company from body', { body: req.body });

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
            req.log.debug('update', 'Successfully updated Company', { company: company });
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
function changeProfilePicture (req, res) {
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
        function (successResponse) {

            var successURL = successResponse.url;

            req.log.debug('successfully uploaded company profile picture to %s', successURL);

            req.company.profileImageURL = successURL;

            return update(req, res);

        }, function (error) {
            req.log.error('changeProfilePicture', 'Failed to save file to cloud', { error: error });
            return res.status(400).send({
                message: 'Unable to save Company Profile Picture. Please try again later'
            });
        }
        );
};

/**
 * deleteCompany an Company
 */
function deleteCompany (req, res) {
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
function list (req, res) {
    req.log.debug('[CompaniesCtrl.list] Start');

    req.sort = '-created';

    executeQuery(req, res);
};

function listDrivers (req, res) {
    req.log.debug('[CompaniesCtrl.listDrivers] Start');

    req.log.debug('NOT IMPLEMENTED');

    res.json([{
        error: 'NOT IMPLEMENTED',
        about: 'THIS METHOD IS NOT IMPLEMENTED'
    }]);
};

function companiesByUserID (req, res) {
    req.log.debug({ func: 'companiesByUserID' }, 'Start');


    req.query = {
        owner: req.params.userId
    };

    req.log.debug({ func: 'companiesByUserID', query: req.query }, 'Searching for companies based on parameterId');

    executeQuery(req, res);
};

function companyByUserID (req, res, next) {

    req.log.debug({ func: 'companyByUserID', params: req.params }, 'Start');


    req.query = {
        owner: req.params.userId
    };

    Company.findOne(req.query)
        .populate('owner', 'displayName')
        .populate('subscription')
        .exec(function (err, company) {
            if (err) {
                req.log.error({ error: err, query: req.query, func: 'companyByUserId' }, 'Error Querying for company');
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else if (!!company) {
                req.log.debug({ func: 'companyByUserId', companyId: company.id }, 'Found Company for id:%s', company._id);
                req.company = company;
                //res.json(company);

                return next();
            } else {
                req.log.info({ func: 'companyByUserId' }, 'No company available for user');
                next();
            }
        });
};

/**
 * Company middleware
 */
function companyByID (req, res, next, id) {
    if (/([0-9a-f]{24})$/i.test(id)) {
        req.log.debug({ companyId: id }, 'Querying for company with id %s', id);

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

                req.log.trace({ company: company }, 'Found company: %s', company && company.id);
                req.company = company;
                next();
            });
    } else {
        req.log.trace({ companyId: id }, '`%s` is not a valid companyId', id);
        next();
    }
};

/**
 * Company authorization middleware
 */
function hasAuthorization (req, res, next) {
    req.log.trace('hasAuthorization', 'Start', { company: req.company, user: req.user });
    req.log.debug('hasAuthorization', 'Start', { company: req.company.owner._id, user: req.user._id });

    if (req.user.equals(req.company.owner)) {
        next();
    }
    else if (req.user.isAdmin) {
        req.log.info({ company: { id: req.company.id, user: req.user._id } }, 'COmpany being edited by admin `%s`', req.user.username);
        next();
    }
    else {
        req.log.debug({ company: { id: req.company.id, owner: req.company.owner } }, 'Owner != User :(: %j vs %j', req.company.owner, req.user);
        return res.status(403).send('User is not authorized');
    }
};

/**
 * Follow & Social Logic
 */
function follow(req, res) {
    if (!req.company) {
        return res.status(404);
    }
    var followerCt = req.company.followers.length;
    
    if (_.contains(req.company.followers)) {
        return res.status(304).json(req.company);
    }
     
    req.company.followers.push(req.user._id);
    
    req.company.save().then(
        function success(company) {
            req.log.debug({ func: 'company.unfollow', result: company }, 'Saved Follower #%d to Company (had %d followers)', company.followers.length, followerCt);

            return res.json(company);
        },
        function reject(err) {
            req.log.error({ err: err, func: 'company.unfollow' }, 'Failed to save company with new follower');
            
            return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
        });
}
 
function unfollow(req, res) {
    if (!req.company) {
        return res.status(404);
    }
    var followerCt = req.company.followers.length;
    
    if (!_.contains(req.company.followers)) {
        return res.status(304).json(req.company);
    }
     
    req.company.followers.pull(req.user._id);
    
    req.company.save().then(
        function success(company) {
            req.log.debug({ func: 'company.unfollow', result: company }, 'Removed Follower #%d to Company (had %d followers)', company.followers.length, followerCt);

            return res.json(company);
        },
        function reject(err) {
            req.log.error({ err: err, func: 'company.unfollow' }, 'Failed to save company with new follower');
            
            return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
        });
 }
 
 





