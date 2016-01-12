'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    path = require('path'),
    mongoose = require('mongoose'),
    At = mongoose.model('At'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

var atsRegistry = {
    luceo: require(path.resolve('./modules/ats/server/services/luceo.server.service'))
};

var defaultATS = 'luceo';

//// ATS Top-Level Operations
exports.list = list;
exports.atsByID = atsByID;

/// ATS Specific Operations
exports.createApplicant = createApplicant;
exports.read = readApplicant;
exports.update = updateApplicant;
exports.removeApplicant = removeApplicant; 

/**
 * @desc Creates a new Applicant in the defined ATS
 */
function createApplicant(req, res) {

    if (!req.job || _.isEmpty(req.job.remoteSystemId)) {
        return res.status(400).send({
            message: 'Job `' + (req.job && req.job.id ||
                'n/a') + '` does not have a remote system ID'
        });
    }

    req.ats = req.ats || atsRegistry[req.job.remoteSystem] || atsRegistry[defaultATS];

    var atsApplicants = req.ats.applicant;
    var atsApplication = req.ats.application;

    if (_.isEmpty(atsApplicants) || !_.isFunction(atsApplicants.create)) {
        return res.status(400).send({
            message: req.atsId + ' does not support applicant creation'
        });
    }
    if (_.isEmpty(atsApplication) || !_.isFunction(atsApplication.create)) {
        return res.status(400).send({
            message: req.atsId + ' does not support job applications'
        });
    }

    atsApplicants.findByUser(req.user)
        .then(function processSearch(foundApplicant) {
            if (!!foundApplicant && !!foundApplicant.id) {
                req.log.debug({ func: 'createApplicant.processSearch', applicant: foundApplicant }, 'Found Existing Applicant');

                return atsApplicants.update(foundApplicant.id, req.user)
                    .catch(function catchUpdateError(err) {
                        
                        req.log.error({ func: 'createApplicant.processSearch', err: err }, 'Caught error while updating applicant ... Returning initial found applicant');
    
                        return foundApplicant;
                    });
            }
            
            throw new Error('No Applicant Found');
        })
        .catch(function (err) {
            req.log.debug({ func: 'createApplicant.processApplicant', err: err }, 'Creating New Applicant');
            return atsApplicants.create(req.user);
        })
        .then(function processApplicant(remoteApplicant) {
            req.log.debug({ func: 'createApplicant.processApplicant', applicant: remoteApplicant }, 'Found or Created remote applicant');
            
            // TODO: Implement Saving of Remote Applicant ID to DB
            
            return atsApplication.create(remoteApplicant.id, req.job);
        },
            function handleBadApplicant(err) {
                debugger;
                req.log.error({ func: 'createApplicant.handleBadApplicant', err: err }, 'Failed to create remote applicant');
                // TODO: Handle specific 'required field' errors
            
                throw err;
            })
        .then(function processApplication(remoteApplication) {
            req.log.debug({ func: 'createApplicant.processApplication', application: remoteApplication }, 'Created remote applicant');
            
            // TODO: Save Application Status to the DB
            
            debugger;

            return remoteApplication;
        },
            function handleBadApplication(err) {
                debugger;
                req.log.error({ func: 'createApplicant.handleBadApplication', err: err }, 'Failed to create remote application');
                // TODO: Handle specific 'required field' errors
            
                throw err;
            })
        .then(function returnRemoteApplicationStatus(remoteApplication) {
            res.json({
                remoteApplicationId: remoteApplication.id,
                status: 'success'
            });
        })
        .catch(function handleErrors(err) {
            res.status(400).send({
                message: err.message || 'Failed to Create Application to Job',
                err: err
            });
        })

}

/**
 * Load the applicant from the Remote System
 */
function readApplicant(req, res) {

    var atsApplicants = req.ats.applicant;

    if (_.isEmpty(atsApplicants) || _.isEmpty(atsApplicants.getByUser)) {
        return res.status(400).send({
            message: req.atsId + ' does not support applicant loading'
        });
    }

    var applicant = atsApplicants.getByUser(req.user);



}

/**
 * Update a At
 */
function updateApplicant(req, res) {
    var ats = req.ats;

    ats = _.extend(ats, req.body);

    ats.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(ats);
        }
    });
}

/**
 * Delete an At
 */
function removeApplicant(req, res) {
    var ats = req.ats;

    ats.remove(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(ats);
        }
    });
}

/**
 * List of Ats
 */
function list(req, res) {
    res.json(_.keys(atsRegistry));
}

/**
 * At middleware
 */
function atsByID(req, res, next, id) {

    try {
        req.atsId = String(id).toLowerCase();
        req.ats = atsRegistry[req.atsId];

        if (_.isEmpty(req.ats)) {
            return next(new Error('Invalid ATS Specified: `' + id + '`'));
        }
    } catch (err) {
        return next(new Error('Unknown Error Occurred', err));
    }

    next();
}