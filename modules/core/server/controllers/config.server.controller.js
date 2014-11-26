'use strict';

var constants = require('../models/outset.constants');

exports.getConfig = function(req, res, next, varName) {

    switch (varName) {
        case 'us_states':
            req.configVal = constants.us_states;
            return next();
        case 'base_schedule':
            req.configVal = constants.base_schedule;
            return next();
        default:
            next();
    }
};

exports.getAllConfigs = function(req, res) {
    var response = {
        base_schedule: constants.base_schedule,
        us_states: constants.us_states
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
