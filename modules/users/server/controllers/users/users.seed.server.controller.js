'use strict';

/**
 * Module dependencies.
 */
var _        = require('lodash'),
    path         = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    config       = require(path.resolve('./config/config')),
    mongoose     = require('mongoose'),
    User         = mongoose.model('User'),
    SeedUser         = mongoose.model('SeedUser'),
    emailer      = require(path.resolve('./modules/emailer/server/controllers/emailer.server.controller')),
    Q            = require('q'),
    log = require(path.resolve('./config/lib/logger')).child({
        module: 'users.seed',
        file: 'users.seed.server.controller'
    });


exports.createSeed = function(req, res) {
    var seed = new SeedUser(req.body);

    log.info({func: 'createSeed', body: req.body}, 'Creating new Seed');

    seed.save().then(function(success) {

        log.info('Successfully created seed user');
        emailer.sendTemplateBySlug('thank-you-for-signing-up-for-outset-driver', success);

        res.json(success);

    }, function(err) {
        if(err.code === 11000) {
            log.info('User email has already been registered');
        }
        else {
            log.error(err, 'Unable to save Seed User');
        }
        
        res.status(400).send({
            message: errorHandler.getErrorMessage(err)
        });
    });
};
