'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Driver = mongoose.model('Driver'),
    constants = require('../../config/env/constants');

/**
 * Globals
 */
var user, driver;

var scheduleCount = constants.baseSchedule.length;

/**
 * Unit tests
 */
describe('Driver Model Unit Tests:', function() {
    beforeEach(function(done) {
        user = new User({
            firstName: 'Full',
            lastName: 'Name',
            displayName: 'Full Name',
            email: 'test@test.com',
            username: 'username',
            password: 'password'
        });

        user.save(function() {
            driver = new Driver({
                user: user,
                licenses: [],
                endorsements: [],
                schedule: []
            });

            done();
        });
    });

    describe('Method Save', function() {
        it('should be able to save without problems', function(done) {
            return driver.save(function(err) {
                should.not.exist(err);
                done();
            });
        });

        it('should have ' + scheduleCount + ' schedule slots after save', function(done) {
            return driver.save(function(err) {
                should.not.exist(err);
                var count = driver.schedule.length;
                count.should.be.exactly(scheduleCount);
                done();
            });
        });

        it('should be able to show an error when try to save without user', function(done) {
            driver.user = null;

            return driver.save(function(err) {
                should.exist(err);
                done();
            });
        });
    });

    afterEach(function(done) {
        Driver.remove().exec();
        User.remove().exec();

        done();
    });
});
