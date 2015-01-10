'use strict';

var constants = require('../models/outset.constants'),
    _ = require('lodash');

exports.getConfig = function(req, res, next, varName) {

    switch (varName) {
        case 'states':
            req.configVal = constants.usStates;
            return next();
        case 'baseSchedule':
            req.configVal = constants.baseSchedule;
            return next();
        case 'reports':
            req.configVal = constants.report_packages;
            return next();
        case 'faqs':
            var filter = req.query;
            console.log('looking up faqs with filter: %j', filter);
            req.configVal = constants.faqs;
            console.log('got %d faqs to return', req.configVal.length);
            return next();
        case 'debug':
            req.configVal = false;
            return next();
        default:
            next();
    }
};

exports.getAllConfigs = function(req, res) {
    var response = {
        baseSchedule: constants.baseSchedule,
        usStates: constants.usStates
    };

    res.jsonp(response);
};

exports.read = function(req, res) {
    if (!req.configVal) {
        return res.status(404).send({
            message: 'No config found'
        });
    }

    return res.json(req.configVal);
};

exports.validate = function(varName, value) {
    switch(varName) {
        case 'states': return validateState(value);
    }
};

function validateState(value) {
    debugger;
    if(_.contains(constants.usStates, value)) {
        console.log('validateState: Contains!');
        return true;
    }
    if(_.find(constants.usStates, value)) {
        console.log('validateState: find!');
        return true;
    }
    if(_.filter(constants.usStates, value)) {
        console.log('validateState: filter!');
        return true;
    }

    return false;
}
