'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Schedule = mongoose.model('Schedule');

/**
 * Globals
 */
var schedule;

/**
 * Unit tests
 */
describe('Schedule Model Unit Tests:', function() {
    beforeEach(function(done) {

        schedule = new Schedule({
            time: {
                start: 0,
                end: 6
            },
            description: 'Midnight to 6 AM'
        });

        done();
    });

    describe('Method Save', function() {
        it('should be able to save without problems', function(done) {
            return schedule.save(function(err) {
                should.not.exist(err);
                done();
            });
        });
        it('should be able to save min end time without problems', function(done) {
            schedule.time.end = 0;

            return schedule.save(function(err) {
                should.not.exist(err);
                done();
            });
        });

        it('should be able to save max start time without problems', function(done) {
            schedule.time.start = 23;

            return schedule.save(function(err) {
                should.not.exist(err);
                done();
            });
        });


        it('should be able to show an error for an invalid start time', function(done) {
            schedule.time.start = -1;

            return schedule.save(function(err) {
                should.exist(err);
                done();
            });
        });

        it('should be able to show an error for an invalid end time', function(done) {
            schedule.time.end = 24;

            return schedule.save(function(err) {
                should.exist(err);
                done();
            });
        });

        it('should be able to show an error for too short a description', function(done) {
            schedule.description = 'A';

            return schedule.save(function(err) {
                should.exist(err);
                done();
            });
        });
    });

    afterEach(function(done) {
        Schedule.remove().exec();

        done();
    });
});
