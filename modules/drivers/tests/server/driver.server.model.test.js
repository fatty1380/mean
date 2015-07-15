'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
    mongoose = require('mongoose'),
    path = require('path'),
    stubs = require(path.resolve('./config/lib/test.stubs')),
    log      = require(path.resolve('./config/lib/logger')).child({
        module: 'tests',
        file  : 'driver.model'
    }),
    constants = require(path.resolve('./modules/core/server/models/outset.constants')),
    _ = require('lodash');


var User = mongoose.model('User'),
    Driver = mongoose.model('Driver');
/**
 * Globals
 */
var user, driver;

var scheduleCount = constants.baseSchedule.length;

/**
 * Unit tests
 */
describe('Driver Model Unit Tests:', function () {
    beforeEach(function (done) {
        driver = new Driver(stubs.user);
        done();
    });

    describe('Method Save', function () {
        it('should be able to save without problems', function (done) {
            return driver.save(function (err) {
                log.debug({ driver: driver }, 'Saved Driver!!!');
                should.not.exist(err);
                
                (driver instanceof Driver).should.be.true;
                
                driver.should.have.property('handle');
                driver.should.have.property('license');
                driver.should.have.property('about');
                driver.should.have.property('started');
                driver.should.have.property('interests');
                driver.should.have.property('reportsData');
                done();
            });
        });

        
    });

    afterEach(function (done) {
        Driver.remove().exec();
        User.remove().exec();

        done();
    });
});
