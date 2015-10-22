'use strict';
var _ = require('lodash');

exports.read = function getExperience(req, res) {
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

exports.create = function addExperience(req, res) {
    req.log.debug({ module: 'drivers', func: 'addExperience', current: req.user.experience, body: req.body }, 'Start');

    if (!_.isArray(req.user.experience)) {
        req.user.experience = [];
    }

    req.user.experience.push(req.body);

    return saveParent(req, res, 'addExperience')
        .then(function (user) {
            loginPostUpdate(req, res, user, 'experience');
        });
};

/**
 * setExperience
 * @description Updates an existing experience item with the contents of the body
 */
exports.update = function setExperience(req, res) {
    if (!req.experience) {
        return res.status(404).send({ message: 'Experience Item not found' });
    }

    req.experience = _.extend(req.experience, req.body);


    return saveParent(req, res, 'setExperience')
        .then(function (user) {
            loginPostUpdate(req, res, user, 'experience');
        });
};

/**
 * deleteExperience
 * @description Removes an existing experience item from the user's obejct.
 */
exports.remove = function deleteExperience(req, res) {
    if (!req.experience) {
        return res.status(404).send({ message: 'Experience Item not found' });
    }

    req.experience.remove();

    return saveParent(req, res, 'deleteExperience')
        .then(function (user) {
            loginPostUpdate(req, res, user, 'experience');
        });
};

function saveParent(req, res, func) {
    return req.user.save()
        .then(function (user) {
            req.log.debug({ module: 'drivers', func: func, result: user.experience }, 'Result');
            return user;
        }, function (err) {
            req.log.error({ module: 'drivers', func: func, error: err }, 'unable to Save updated user object');
            return res.status(400).send({
                message: 'Unable to save changes at this time. Please try again later',
                error: err.stack
            });
        });
}

exports.experienceById = function experienceById(req, res, next, id) {

    var user = req.profile || req.user;

    req.log.debug({ func: 'experienceById', id: id, user: user }, 'start for id: ', id);

    if (!!user && (/^[a-f\d]{24}$/i).test(id)) {
        req.experience = user.experience.id(id);

        if (!!req.experience) {
            req.log.debug({ func: 'experienceById', experience: req.experience, id: id }, 'Found Experience!');
            return next();
        }
    }

    req.log.debug({ func: 'experienceById', id: id }, 'No Experience found for ID');


    return res.status(404).send({
        message: 'Unable to find an experience item associated with that id for that user'
    });

};

// TODO: Combine with drivers.properties.server.controller
function loginPostUpdate(req, res, user, property) {
    req.login(user, function (err) {
        if (err) {
            res.status(400).send(err);
        } else {
            req.log.error({ module: 'drivers', func: 'loginPostUpdate', property: property, User: user, userProp: user[property], reqUser: req.user, reqProp: req.user.props }, 'Post Login Result');

            res.json(user[property]);
        }
    });
}