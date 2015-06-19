'use strict';

var path      = require('path'),
    config    = require(path.resolve('./config/config')),
    constants = require('../models/outset.constants'),
    _         = require('lodash');

var configOptions = {
    'states': constants.usStates,
    'countries': constants.countries,
    'baseSchedule': constants.baseSchedule,
    'reports': constants.reportPackages,
    'faqs': getFAQs,
    'debug': { debug: false },
    'modules': getModules,
    'subscriptions': getSubscriptions
};

exports.getConfig = function (req, res, next, varName) {

    req.log.debug({ file: 'config.server.ctrl', func: 'getConfig' }, 'Looking up config for `%s`', varName);

    var configVal = configOptions[varName.toLowerCase] || { varName: null };

    if (_.isFunction(configVal)) {
        req.configVal = configVal(req);
    } else if (_.isObject(configVal)) {
        req.configVal = configVal;
    } else {
        return next(new Error('Unknown Configuration Option'));
    }

    return next();
};

exports.getAllConfigs = function (req, res) {
    var response = {
        baseSchedule: constants.baseSchedule,
        usStates: constants.usStates
    };

    res.jsonp(response);
};

exports.read = function (req, res) {
    if (!req.configVal) {
        return res.status(404).send({
            message: 'No config found'
        });
    }

    return res.json(req.configVal);
};

exports.validate = function (varName, value) {
    switch (varName) {
        case 'states':
            return validateState(value);
    }
};



function getFAQs(req) {
    var filter = req.query;
    req.log.debug({ file: 'config.server.ctrl', func: 'getConfig' }, 'looking up faqs with filter: %j', filter);
    req.configVal = _.filter(constants.faqs, req.query);
    req.log.debug({ file: 'config.server.ctrl', func: 'getConfig' }, 'got %d faqs to return', req.configVal.length);
}
function getModules(req) {
    req.log.debug({ file: 'config.server.ctrl', func: 'getConfig' }, '[CONFIG] returning module configuration');
    return config.modules;
}

function getSubscriptions(req) {
    req.log.debug({ file: 'config.server.ctrl', func: 'getConfig' }, '[CONFIG] returning company subscription data');
    return constants.subscriptionPackages;
}

function validateState(value) {
    debugger;
    if (_.contains(constants.usStates, value)) {
        return true;
    }
    if (_.find(constants.usStates, value)) {
        return true;
    }
    if (_.filter(constants.usStates, value)) {
        return true;
    }

    return false;
}
