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
    var atsApplicants = req.ats.applicant;
    
    if (_.isEmpty(atsApplicants) || _.isEmpty(atsApplicants.get)) {
        return res.status(400).send({
            message: req.atsId + ' does not support applicant creation'
        });
    }
    
    var applicant = atsApplicants.create(req.user);
    
}

/**
 * Load the applicant from the Remote System
 */
function readApplicant(req, res) {
    
    var atsApplicants = req.ats.applicant;
    
    if (_.isEmpty(atsApplicants) || _.isEmpty(atsApplicants.get)) {
        return res.status(400).send({
            message: req.atsId + ' does not support applicant loading'
        });
    }
    
    var applicant = atsApplicants.get(req.user)
    
    

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