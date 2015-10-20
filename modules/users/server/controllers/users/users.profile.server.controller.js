'use strict';

/**
 * Module dependencies.
 */
var _            = require('lodash'),
    path         = require('path'),
    fileUploader = require(path.resolve('./modules/core/server/controllers/s3FileUpload.server.controller')),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    config       = require(path.resolve('./config/config')),
    mongoose     = require('mongoose'),
    passport     = require('passport'),
    User         = mongoose.model('User'),
    Q            = require('q'),
    log = require(path.resolve('./config/lib/logger')).child({
        module: 'users',
        file: 'users.profile.server.controller'
    });

_.extend(exports, {
    update: update,
    search: search,
    list: list,
    readProfile: read,
    changeProfilePicture: changeProfilePicture,
    me: me
});

// exports.update = update;
// exports.search = search;
// exports.list = list;
// exports.readProfile = read;
// exports.changeProfilePicture = changeProfilePicture;
// exports.me = me;

//////////////////////////////////////////////

/**
 * Update user details
 */
function update(req, res) {

    // For security measurement we remove the roles from the req.body object
    delete req.body.roles;
    req.log.debug({func: 'update', file: 'users.profile.ctrl', body: req.body}, 'Updating Logged in user with body contents');

    if (req.user) {
        // Merge existing user
        var user             = _.extend(req.user, req.body);
        user.modified    = Date.now();

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
}


/**
 * Update profile picture
 */
function changeProfilePicture(req, res) {
    var user = req.user;

    if (user) {
        fileUploader.saveFileToCloud(req.files).then(
            function (successResponse) {

                var successURL = successResponse.url;

                req.log.debug({func: 'changeProfilePicture', file: 'users.profile'}, 'successfully uploaded profile picture to %s', successURL);

                user.profileImageURL = successURL;

                req.log.debug({func: 'changeProfilePicture', file: 'users.profile'}, '[ChangeProfilePicture] - Saving User with URL: %s', user.profileImageURL);

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
}

function search(req, res, next) {

    req.log.debug({query: req.query}, 'Searching based on query string');
    var queryStrings = (_.isString(req.query.text) ? [req.query.text] : req.query.text) || [];

    var qs = _.map(queryStrings, function(qString) {
        return /[@\.]/.test(qString) ? '"' + qString + '"' : qString;
    });

    req.log.debug({query: qs}, 'Updated Searching based on query string to `%s`', qs);

    req.select = 'firstName lastName handle profileImageURL type driver company email';

    User.find(
        {$text: {$search: qs.join(' ')}},
        {score: {$meta: 'textScore'}}
    ).sort({score: {$meta: 'textScore'}})
        .select(req.select)
        .exec(function (err, users) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                req.log.debug({func: 'search', file: 'users.profile', users: users}, '[Profiles] Returning %d profiles', (users || []).length);
                res.json(users);
            }
        });
}

function list(req, res, next) {
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

    req.log.debug({func: 'list', file: 'users.profile'}, 'Query Search terms: `%s`', queryStrings);

    _.each(queryStrings, function (search) {
        req.log.debug({func: 'list', file: 'users.profile'}, 'Adding search term `%s`', search);

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
                req.log.debug({func: 'list', file: 'users.profile'}, '[Profiles] Returning %d profiles', (users || []).length);
                res.json(users);
            }
        });
}


function read(req, res) {
    if (!req.profile) {
        return res.status(404).send({
            message: 'No profile found'
        });
    }
    
    req.profile.cleanse();

    req.log.debug({func: 'readProfile', file: 'users.profile', profile: req.profile}, '[Profiles] Returning profile');
    res.json(req.profile);
}

/**
 * Send User
 */
function me(req, res) {
    if (req.isUnauthenticated()) {
        log.trace({ func: 'me' }, 'Unauthorized user');
        return res.status(401).send({
            message: 'unauthorized'
        });
    }

    res.json(req.user);
}
