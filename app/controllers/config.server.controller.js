'use strict';

var constants = require('../../config/env/constants');

exports.getConfig = function(req, res, next, varName) {

    switch (varName) {
        case 'us_states':
            req.configVal = constants.us_states;
            return next();
        case 'base_schedule':
            req.configVal = constants.base_schedule;
            return next();
        default:
            res.status(400).send({
                message: 'Method not implemented or config not found'
            });
    }
};

exports.getAllConfigs = function(req, res) {
    var response = {
        base_schedule: constants.base_schedule,
        us_states: constants.us_states
    };

    res.jsonp(response);
};
