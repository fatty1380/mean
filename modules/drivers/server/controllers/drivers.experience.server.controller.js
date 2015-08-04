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

exports.addExperience = function addExperience(req, res) {
    req.log.debug({ module: 'drivers', func: 'addExperience', current: req.user.experience, body: req.body }, 'Start');

    req.user.experience.push(req.body);

    return req.user.save()
        .then(function (user) {
            req.log.debug({ module: 'drivers', func: 'addExperience', result: user.experience }, 'Result');

            req.user = user;

            res.json(req.user.experience);
        }, function (err) {
            req.log.error({ module: 'drivers', func: 'addExperience', error: err }, 'unable to add Experience for driver user');
            return res.send(400, {
                message: 'Unable to save changes at this time. Please try again later',
                error: err.stack
            });
        });
};

exports.setExperience = function setExperience(req, res) {
    if (!req.experience) {
        return req.status(404).send({ message: 'Experience Item not found' });
    }

    req.experience = _.extend(req.experience, req.body);

    return req.experience.save()
        .then(function (experience) {
            req.log.debug({ module: 'drivers', func: 'setExperience', result: experience }, 'Result');

            req.experience = experience;

            res.json(req.experience);
        }, function (err) {
            req.log.error({ module: 'drivers', func: 'setExperience', error: err }, 'unable to update Experience for driver user');
            return res.send(400, {
                message: 'Unable to save changes at this time. Please try again later',
                error: err.stack
            });
        });
}

exports.experienceById = function experienceById(req, res, next, id) {

    var user = req.profile || req.user;
    
    req.log.debug({ func: 'experienceById', id: id, user: user }, 'start for id: ', id);

    if (!!user && (/^[a-f\d]{24}$/i).test(id)) {
        req.experience = user.experience.id(id)
        
        if (!!req.experience) {
            req.log.debug({ func: 'experienceById', experience: req.experience, id: id }, 'Found Experience!');
            return next();
        }
    }

    req.log.debug({ func: 'experienceById', id: id }, 'No Experience found for ID');
            

    return res.status(404).send({
        message: 'Unable to find an experience item associated with that id for that user'
    });

}