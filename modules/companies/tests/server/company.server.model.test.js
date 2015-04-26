'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Company = mongoose.model('Company');

/**
 * Globals
 */
var user, company;

/**
 * Unit tests
 */
describe('Company Model Unit Tests:', function() {
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
			company = new Company({
				name: 'Company Name',
				user: user
			});

			done();
		});
	});

	describe('Method Save', function() {
		it('should be able to save without problems', function(done) {
			return company.save(function(err) {
				should.not.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without name', function(done) { 
			company.name = '';

			return company.save(function(err) {
				should.exist(err);
				done();
			});
		});
	});

    describe('Gateway Functionality', function() {
        it('should save a default gateway with the expected settings', function(done) {
            return company.save(function(err) {
                should.not.exist(err);

                company.should.have.property('gateway');

                console.log('COMPANY GATEWAY: %j', company.gateway);

                (company.gateway === null).should.not.be.true;

                company.gateway.should.have.property('sku');
                company.gateway.should.have.property('required', false);
                company.gateway.should.have.property('payment', 'applicant');
                company.gateway.should.have.property('releaseType');

                done();
            });
        });
    });

	afterEach(function(done) { 
		Company.remove().exec();
		User.remove().exec();

		done();
	});
});
