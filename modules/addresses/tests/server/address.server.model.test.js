'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Address = mongoose.model('Address');

/**
 * Globals
 */
var address;

/**
 * Unit tests
 */
describe('Address Model Unit Tests:', function() {
    beforeEach(function(done) {

        address = new Address({
            type: 'main',
            streetAddresses: ['123 Anystreet'],
            city: 'Any Town',
            state: 'AZ',
            zipCode: '83421'
        });

        done();
    });

    describe('Method Save', function() {
        it('should be able to save without problems', function(done) {
            return address.save(function(err) {
                should.not.exist(err);
                done();
            });
        });

        it('should be able to save multi-line addresses without problems', function(done) {
            address.streetAddresses.push('Unit F');

            return address.save(function(err) {
                should.not.exist(err);
                done();
            });
        });

        // BEGIN Validation Checks : Error States //

        it('should be able to show an error when try to save without type', function(done) {
            address.type = '';

            return address.save(function(err) {
                should.exist(err);
                done();
            });
        });

        it('should be able to show an error when try to save without a street address', function(done) {
            address.streetAddresses = [];

            return address.save(function(err) {
                should.exist(err);
                done();
            });
        });

        it('should be able to show an error when the state is not a valid state', function(done) {
            address.state = 'JF';

            return address.save(function(err) {
                should.exist(err);
                done();
            });
        });

        it('should be able to show an error when no state is defined', function(done) {
            address.state = '';
            return address.save(function(err) {
                should.exist(err);
                done();
            });
        });

        it('should be able to show an error when a random type is defined', function(done) {
            address.type = 'shenanigans';

            return address.save(function(err) {
                should.exist(err);
                done();
            });
        });
    });

    afterEach(function(done) {
        Address.remove().exec();
        User.remove().exec();

        done();
    });
});
