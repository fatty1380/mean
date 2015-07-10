'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
mongoose   = require('mongoose'),
User       = mongoose.model('User'),
Address    = mongoose.model('Address');

/**
 * Globals
 */
var address;

/**
 * Unit tests
 */
describe('Address Model Unit Tests:', function () {
    beforeEach(function (done) {

        address = new Address({
            type: 'main',
            streetAddresses: ['123 Anystreet'],
            city: 'Any Town',
            state: 'AZ',
            zipCode: '83421'
        });

        done();
    });

    describe('Method Save', function () {
        it('should be able to save without problems', function (done) {
            return address.save()
                .then(function (address) {
                    console.log('saved address %j', address);
                    done();
                }, function (err) {
                    console.log('got error  %j', err);
                    should.not.exist(err);
                    done(err);
                });
        });

        it('should be able to save multi-line addresses without problems', function (done) {
            address.streetAddresses.push('Unit F');

            return address.save(function (err) {
                should.not.exist(err);
                done();
            });
        });

        // BEGIN Validation Checks : Error States //

        it('should be able to show an error when try to save without type', function (done) {
            address.type = '';

            return address.save(function (err) {
                should.exist(err);
                done();
            });
        });

        it('should compact empty street address lines', function (done) {
            address.streetAddresses = ['', '123 Fake Street'];

            return address.save()
                .then(function (address) {
                    address.should.have.property('streetAddresses').with.length(1);

                    address.streetAddresses = ['', ''];

                    return address.save();
                }, done)
                .then(function(address) {
                    address.should.have.property('streetAddresses').with.length(0);
                    done();
                }, done);
        });

        it('should be able to show an error when the state is not a valid state', function (done) {
            address.state = 'JF';

            return address.save(function (err) {
                should.exist(err);
                done();
            });
        });

        it('should be able to show an error when a random type is defined', function (done) {
            address.type = 'shenanigans';

            return address.save(function (err) {
                should.exist(err);
                done();
            });
        });

        it('should be able to define a custom type', function (done) {
            address.type = 'other';
            address.typeOther = 'shenanigans';

            return address.save(function (err) {
                should.not.exist(err);

                address.should.have.property('type', 'other');
                address.should.have.property('typeOther', 'shenanigans');

                done();
            });
        });

        describe('virtual properties', function() {
            it('should not report as empty when a normal address is saved', function(done) {
                address = new Address();

                address.save()
                .then(function(address) {
                        address.should.have.property('empty', true);
                        address.should.have.property('zipOnly', false);
                        done();
                    }, done);
            });
            it('should report as empty when a blank address is saved', function(done) {
                address.save()
                    .then(function(address) {
                        address.should.have.property('empty', false);
                        address.should.have.property('zipOnly', false);
                        done();
                    }, done);

            });
            it('should report as zipOnly when saved with only a zip', function(done) {
                address = new Address({zipCode: '12345'});

                address.save()
                    .then(function(address) {
                        address.should.have.property('empty', false);
                        address.should.have.property('zipOnly', true);
                        done();
                    }, done);

            });
        });
    });

    afterEach(function (done) {
        Address.remove().exec();
        User.remove().exec();

        done();
    });
});
