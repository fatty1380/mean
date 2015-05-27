'use strict';

/**
 * Module dependencies.
 */
var _            = require('lodash'),
    fs           = require('fs'),
    path         = require('path'),
    fileUploader = require(path.resolve('./modules/core/server/controllers/s3FileUpload.server.controller')),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    config       = require(path.resolve('./config/config')),
    mongoose     = require('mongoose'),
    passport     = require('passport'),
    User         = mongoose.model('User'),
    Q            = require('q');

/**
 * Update user details
 */
exports.update = function (req, res) {
    // Init Variables
    var user = req.user;

    // For security measurement we remove the roles from the req.body object
    delete req.body.roles;

    if (user) {
        // Merge existing user
        user             = _.extend(user, req.body);
        user.modified    = Date.now();
        user.displayName = user.firstName + ' ' + user.lastName;

        user.save(function (err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                req.login(user, function (err) {
                    if (err) {
                        res.status(400).send(err);
                    } else {
                        res.json(user);
                    }
                });
            }
        });
    } else {
        res.status(400).send({
            message: 'User is not signed in'
        });
    }
};


/**
 * Update profile picture
 */
exports.changeProfilePicture = function (req, res) {
    var user = req.user;

    if (user) {
        fileUploader.saveFileToCloud(req.files).then(
            function (successResponse) {

                var successURL = successResponse.url;

                console.log('successfully uploaded profile picture to %s', successURL);

                user.profileImageURL = successURL;

                console.log('[ChangeProfilePicture] - Saving User with URL: %s', user.profileImageURL);

                user.save(function (saveError) {
                    if (saveError) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(saveError)
                        });
                    } else {
                        req.login(user, function (err) {
                            if (err) {
                                res.status(400).send(err);
                            } else {
                                res.json(user);
                            }
                        });
                    }
                });
            },
            function (error) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(error)
                });
            }
        );
    }
    else {
        res.status(400).send({
            message: 'User is not signed in'
        });
    }
};

exports.list = function (req, res, next) {
    var select = req.select || '-password -oldPass -salt';

    // req.query.text = ['jon', 'doe']
    //
    // USER WHERE   ( 'jon' IN displayName OR 'jon' in handle OR 'jon' in email)
    //              ( 'doe' IN displayName OR 'doe' in handle OR 'doe' in email)
    //
    // .or([
    //      {displayName: new RegExp(text[0], "i")}
    //      {handle: new RegExp(text[0], "i")}
    //      {email: new RegExp(text[0], "i")}
    //

    var query = User.find();

    var queryStrings = (_.isString(req.query.text) ? [req.query.text] : req.query.text) || [];

    req.log.debug('Query Search terms: `%s`', queryStrings);

    _.each(queryStrings, function (search) {
        req.log.debug('Adding search term `%s`', search);

        var q = [
            {displayName: new RegExp(search, 'i')},
            {handle: new RegExp(search, 'i')},
            {email: new RegExp(search, 'i')}
        ];

        query.and({$or : q});
    });

    query.select(select)
        .sort('-created')
        .exec(function (err, users) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                console.log('[Profiles] Returning %d profiles', (users || []).length);
                res.json(users);
            }
        });
};

exports.readProfile = function (req, res) {
    if (!req.profile) {
        return res.status(404).send({
            message: 'No profile found'
        });
    }

    console.log('[Profiles] Returning profile %j', req.profile);
    res.json(req.profile);
};

/**
 * Send User
 */
exports.me = function (req, res) {

    if (!req.user) {
        return res.status(401).send({
            message: 'unauthorized'
        });
    }

    res.json(req.user);
};
