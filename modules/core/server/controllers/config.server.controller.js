'use strict';

var constants = require('../models/outset.constants');

exports.getConfig = function(req, res, next, varName) {

    switch (varName) {
        case 'usStates':
            req.configVal = constants.usStates;
            return next();
        case 'baseSchedule':
            req.configVal = constants.baseSchedule;
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
