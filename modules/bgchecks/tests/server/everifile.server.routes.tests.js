'use strict';

var should          = require('should'),
    request         = require('supertest'),
    path            = require('path'),
    mongoose        = require('mongoose'),
    Bgcheck         = mongoose.model('BackgroundReport'),
    ReportType      = mongoose.model('ReportType'),
    ReportApplicant = mongoose.model('ReportApplicant'),
    path            = require('path'),
    express         = require(path.resolve('./config/lib/express')),
    config          = require(path.resolve('./config/config')),
    everifile       = require(path.resolve('modules/bgchecks/server/controllers/everifile.server.service'));

/**
 * Globals
 */
var app, agent, credentials, user, article, session;



/**
 * Article routes tests
 */
describe.skip('Everifile CRUD tests', function (done) {

    beforeEach(function (done) {
        everifile.GetSession()
            .then(function (sessionResponse) {
                should.exist(sessionResponse.jar);

                session = sessionResponse;
            })
            .catch(function (err) {
                console.error('Error Initializing tests ', err);
                should.not.exist(err);
            }).finally(function() {

                it('Should have a session defined', function (done) {
                    should.exist(session);

                    done();
                });
            });


    });

    afterEach(function (done) {

        done();
    });
});
