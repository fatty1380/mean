'use strict';
var _ = require('lodash'),
    path = require('path'),
    Q = require('q');
    
var fileUploader = require(path.resolve('./modules/core/server/controllers/s3FileUpload.server.controller'));

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
    req.log.debug({ module: 'drivers', func: 'setProperties', current: req.user, body: req.body }, 'Start');

    var user = _.extend(req.user);
    user.props = _.extend(user.props, req.body);
    user.markModified('props');

    var p;

    if (req.body.avatar && /^data:/.test(req.body.avatar)) {
        var post = {
            isSecure: false,
            content: req.body.avatar
        };
        
        p = fileUploader.saveContentToCloud(post)
            .then(function success(uploadResponse) {
                user.profileImageURL = user.props.avatar = uploadResponse.url;
                
                return user.save();
            });
    } else {
        p = user.save();
    }

    return p.then(function success(result) {
        loginPostUpdate(req, res, result, 'props');
    }, function reject(err) {
        req.log.error({ module: 'drivers', func: 'setProperties', error: err }, 'unable to set properties for driver user');
        return res.send(400, {
            message: 'Unable to save changes at this time. Please try again later',
            error: err.stack
        });
    });
};

// TODO: Combine with drivers.experience.server.controller
function loginPostUpdate(req, res, user, property) {
    req.login(user, function (err) {
        if (err) {
            res.status(400).send(err);
        } else {
            req.log.error({ module: 'drivers', func: 'loginPostUpdate', property: property, User: user, 
                            userProp: user && user[property], reqUser: req.user, reqProp: req.user.props }, 'Post Login Result');

            res.json(user[property]);
        }
    });
}