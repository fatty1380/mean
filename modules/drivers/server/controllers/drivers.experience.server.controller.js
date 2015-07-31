'use strict';
var _ = require('lodash');

exports.getExperience = function getExperience(req, res) {
    req.log.debug({ module: 'drivers', func: 'getExperience' }, 'Loading Experience');

    if (!!req.profile) {
        req.log.debug({ module: 'drivers', func: 'getExperience', current: req.profile.experience, body: req.body }, 'Returning props from req.profile');

        return res.json(req.profile.experience);
    }

    if (!!req.user) {
        req.log.debug({ module: 'drivers', func: 'getExperience', current: req.user.experience, body: req.body }, 'Returning props from req.user');
        return res.json(req.user.experience);
    }

    return res.status(404);
};

exports.setExperience = function setExperience(req, res) {
    req.log.debug({ module: 'drivers', func: 'setExperience', current: req.user.experience, body: req.body }, 'Start');

    req.user.experience = _.extend(req.user.experience, req.body);

    return req.user.save()
        .then(function (user) {
            req.log.debug({ module: 'drivers', func: 'setExperience', result: user.experience }, 'Result');

            req.user = user;

            res.json(req.user.experience);
        }, function (err) {
            req.log.error({ module: 'drivers', func: 'setExperience', error: err }, 'unable to set Experience for driver user');
            return res.send(400, {
                message: 'Unable to save changes at this time. Please try again later',
                error: err.stack
            });
        });
};