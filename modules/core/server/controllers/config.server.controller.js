'use strict';

var path      = require('path'),
    config    = require(path.resolve('./config/config')),
    constants = require('../models/outset.constants'),
    everifile = require(path.resolve('./config/systems/everifile')),
    _         = require('lodash');

var configOptions = {
    'states': constants.usStates,
    'countries': constants.countries,
    'baseSchedule': constants.baseSchedule,
    'reports': everifile.reportPackages, // constants.reportPackages,
    'faqs': getFAQs,
    'debug': { debug: config.options.debug },
    'modules': getModulesConfig,
    'options': getAppOptions,
    'subscriptions': getSubscriptions
};

exports.getConfig = function (req, res, next, varName) {

    req.log.trace({ file: 'config.server.ctrl', func: 'getConfig', keys: _.keys(configOptions) }, 'Looking up config for `%s`', varName);

    var configVal = configOptions[varName.toLowerCase()] || { varName: null };
    
    req.log.trace({ file: 'config.server.ctrl', func: 'getConfig' }, 'Did you find what you were looking for? %s', !!configVal ? 'YES' : 'NO');

    if (_.isFunction(configVal)) {
        req.log.trace({ file: 'config.server.ctrl', func: 'getConfig' }, 'Launching function');
        req.configVal = configVal(req);
    } else if (_.isObject(configVal)) {
        req.log.debug({ file: 'config.server.ctrl', func: 'getConfig'}, 'returning Object for var `%s`', varName);
        req.log.trace({ file: 'config.server.ctrl', func: 'getConfig', val: configVal }, 'returning Object for var `%s`', varName);
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

    res.json(response);
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
    req.log.trace({ file: 'config.server.ctrl', func: 'getFAQs' }, 'looking up faqs with filter: %j', filter);
    req.configVal = _.filter(constants.faqs, req.query);
    req.log.trace({ file: 'config.server.ctrl', func: 'getFAQs' }, 'got %d faqs to return', req.configVal.length);
}
function getModulesConfig(req) {
    req.log.trace({ file: 'config.server.ctrl', func: 'getModulesConfig' }, '[CONFIG] returning module configuration');
    return config.modules;
}
function getAppOptions(req) {
    req.log.trace({ file: 'config.server.ctrl', func: 'getAppOptions' }, '[CONFIG] returning app config options');
    return config.options;
}

function getSubscriptions(req) {
    req.log.trace({ file: 'config.server.ctrl', func: 'getSubscriptions' }, '[CONFIG] returning company subscription data');
    return constants.subscriptionPackages;
}

function validateState(value) {
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
