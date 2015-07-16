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
        it('should be able to save without problems', function () {
            return driver.save(function (err) {
                log.debug({ driver: driver }, 'Saved Driver!!!');
                should.not.exist(err);
                
                (driver instanceof Driver).should.be.true;
                
                var d = driver.toJSON();
                
                d.should.have.property('handle', null);
                d.should.have.property('license');
                d.license.should.have.property('class', null);
                d.license.should.have.property('endorsements', []);
                d.license.should.have.property('state', null);
                d.should.have.property('about', null);
                d.should.have.property('interests', []);
                d.should.have.property('reportsData', []);
                
                d.should.have.property('props');
                d.props.should.have.property('started');
                d.props.should.have.property('truck');
                d.props.should.have.property('trailer', []);
                d.props.should.have.property('freight');
                d.props.should.have.property('company');
            });
        });

        
    });

    afterEach(function (done) {
        Driver.remove().exec();
        User.remove().exec();

        done();
    });
});
