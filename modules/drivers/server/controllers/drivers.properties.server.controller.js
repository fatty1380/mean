'use strict';
var _ = require('lodash');

exports.getProperties = function getProperties(req, res) {
    req.log.debug({ module: 'drivers', func: 'getProperties' }, 'Loading Properties');

    if (!!req.profile) {
        req.log.debug({ module: 'drivers', func: 'getProperties', current: req.profile.props, body: req.body }, 'Returning props from req.profile');

        return res.json(req.profile.props);
    }

    if (!!req.user) {
        req.log.debug({ module: 'drivers', func: 'getProperties', current: req.user.props, body: req.body }, 'Returning props from req.user');
        return res.json(req.user.props);
    }

    return res.status(404);
};

exports.setProperties = function setProperties(req, res) {
    req.log.error({ module: 'drivers', func: 'setProperties', current: req.user.props, body: req.body }, 'Start');

    var user = _.extend(req.user.props, req.body);
    req.log.error({ module: 'drivers', func: 'setProperties', extended: user.props }, 'Result');

    return user.save()
        .then(function (user) {
            req.log.error({ module: 'drivers', func: 'setProperties', result: user.props, user: user }, 'Result');

            req.user = user;
            req.log.error({ module: 'drivers', func: 'setProperties', reqUser: req.user }, 'Result');

            res.json(req.user.props);
        }, function (err) {
            req.log.error({ module: 'drivers', func: 'setProperties', error: err }, 'unable to set properties for driver user');
            return res.send(400, {
                message: 'Unable to save changes at this time. Please try again later',
                error: err.stack
            });
        });
};