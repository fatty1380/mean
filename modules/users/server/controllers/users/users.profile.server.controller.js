'use strict';

/**
 * Module dependencies.
 */
var _        = require('lodash'),
fs           = require('fs'),
path         = require('path'),
errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
config       = require(path.resolve('./config/config')),
mongoose     = require('mongoose'),
passport     = require('passport'),
User         = mongoose.model('User'),
Q            = require('q');

var s3 = require('s3');
var client;
var publicURL;

if (!!config.services.s3 && config.services.s3.enabled) {
    var options = config.services.s3.clientConfig;
    options.s3Options = config.services.s3.s3Options;
    client = s3.createClient(options);

}

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
        user = _.extend(user, req.body);
        user.modified = Date.now();
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

var getFileURL = function (filename) {
    var localFileLocation = config.services.fs.writePath + filename;
    if (!!client) {

        console.log('[getFileURL] Attempting S3 Upload');
        var deferred = Q.defer();
        var params = {
            localFile: localFileLocation,

            s3Params: {
                Bucket: config.services.s3.s3Options.bucket,
                Key: config.services.s3.folder + filename,
                ACL: 'public-read'
            }
        };


        console.log('[getFileURL] Uploading with parameters: %j', params);


        var uploader = client.uploadFile(params);
        uploader.on('error', function (err) {
            console.error('[getFileURL] unable to upload:', err.stack);

            deferred.reject(err);
        });
        uploader.on('end', function (data) {
            console.log('[getFileURL] done uploading, got data: %j', data);

            var publicURL = s3.getPublicUrlHttp(params.s3Params.Bucket, params.s3Params.Key);

            console.log('[getFileURL] Got public URL: %s', publicURL);

            deferred.resolve(publicURL);
        });

        return deferred.promise;
    }
    else {

        console.log('[getFileURL] No S3 Configured - using local url: %s', publicURL);
        return localFileLocation;
    }
};

/**
 * Update profile picture
 */
exports.changeProfilePicture = function (req, res) {
    var user = req.user;
    var message = null;

    if (user) {
        fs.writeFile(config.services.fs.writePath + req.files.file.name, req.files.file.buffer,
            function (uploadError) {
                if (uploadError) {
                    return res.status(400).send({
                        message: 'Error occurred while uploading profile picture'
                    });
                } else {


                    getFileURL(req.files.file.name)
                        .then(function (url) {
                            console.log('[ChangeProfilePicture.S3] - S3 request completed with url: "%s"', url);
                            return url;
                        }, function (err) {
                            console.log('[ChangeProfilePicture.S3] - S3 failed with err: %j', err);

                            var url = config.services.fs.writePath + req.files.file.name;
                            console.log('[ChangeProfilePicture.S3] resolving with base URL', url);

                            return url;

                        })
                        .then(function (url) {
                            user.profileImageURL = url;

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
                        });


                }
            }
        )
        ;

    }
    else {
        res.status(400).send({
            message: 'User is not signed in'
        });
    }
}
;

exports.list = function (req, res, next) {
    User
        .find()
        .sort('-created')
        .exec(function (err, users) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.jsonp(users);
            }
        });
};

exports.readProfile = function (req, res) {
    if (!req.profile) {
        return res.status(404).send({
            message: 'No profile found'
        });
    }

    res.jsonp(req.profile);
};

/**
 * Send User
 */
exports.me = function (req, res) {

    if (!req.user) {
        return res.status(404).send({
            message: 'No user found'
        });
    }

    res.json(req.user);
};
