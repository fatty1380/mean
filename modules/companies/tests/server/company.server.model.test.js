'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Company = mongoose.model('Company'),
	Subscription = mongoose.model('Subscription');

/**
 * Globals
 */
var user, company, subscription;

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
			password: 'password',
            provider: 'local',
            type: 'driver'
		});

		user.save()
            .then(function(user) {
            subscription = new Subscription({
                name: 'Plan Details',
                sku: 'PLAN_DETAILS'
            });

            return subscription.save();
        }, function(err) {
                console.error('Error Saving User', err);
            })
            .then(function() {
			company = new Company({
				name: 'Company Name',
				user: user
			});

			done();
		}, function(err) {
            console.error('Error Saving Subscription', err);
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




        it('should interpret an empty Address as an `empty` address with the corret virtuals', function(done) {
            var proto = {};
            company.locations = [proto];

            return company.save(function (err) {
                should.not.exist(err);

                company.should.have.property('locations').with.length(1);

                var loc = company.locations[0];

                should.exist(loc);

                loc.should.have.property('zipOnly', false);
                loc.should.have.property('empty', true);
                loc.should.have.property('type', 'main');

                done();
            });
        });


        it('should be able to save with a POJO address', function (done) {
            var proto = {city: 'Laramie', state: 'WY'};
            company.locations = [proto];

            return company.save(function (err) {
                should.not.exist(err);

                company.should.have.property('locations').with.length(1);

                var loc = company.locations[0];

                should.exist(loc);

                loc.should.have.property('city', proto.city);
                loc.should.have.property('state', proto.state);

                loc.should.have.property('zipOnly', false);
                loc.should.have.property('empty', false);
                loc.should.have.property('type', 'main');

                done();
            });
        });



        it('should be able to update an existing address', function (done) {
            var proto = {city: 'Laramie', state: 'WY'};
            company.locations = [proto];

            return company.save(function (err) {
                should.not.exist(err);

                company.should.have.property('locations').with.length(1);

                proto = {city: 'Seattle', state: 'WA', zipCode: '98011'};
                company.locations = [proto];

                return company.save(function(err) {
                    should.not.exist(err);

                    var loc = company.locations[0];

                    should.exist(loc);

                    loc.should.have.property('city', proto.city);
                    loc.should.have.property('state', proto.state);
                    loc.should.have.property('zipCode', proto.zipCode);

                    loc.should.have.property('zipOnly', false);
                    loc.should.have.property('empty', false);
                    loc.should.have.property('type', 'main');

                    done();

                });
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

        it('should save a POCO gateway without problem', function(done) {
            company.gateway = {payment: 'company'};

            return company.save(function(err) {
                should.not.exist(err);

                company.should.hae.property('gateway');

                (company.gateway === null).should.not.be.true;

                company.gateway.should.have.property('sku');
                company.gateway.should.have.property('required', false);
                company.gateway.should.have.property('payment', 'company');
                company.gateway.should.have.property('releaseType');


            })
        })
    });

    describe('Subscription Functionality', function() {


        it('should interpret an empty Address as an `empty` subscription with the corret virtuals', function(done) {
            company.subscription = subscription;

            return company.save(function (err) {
                if(!!err) { console.log(err); }
                should.not.exist(err);

                company.should.have.property('subscription');

                var result = company.subscription;

                should.exist(result);

                result.should.have.property('name', subscription.name);
                result.should.have.property('sku', subscription.sku);

                result.should.have.property('used', 0);
                result.should.have.property('available', 1);
                result.should.have.property('renews', subscription.renews);
                result.should.have.property('status', 'active');

                done();
            });
        });



        it('should be able to save with an existing subscription', function (done) {
            company.subscription = subscription;

            return company.save(function (err) {
                should.not.exist(err);

                company.should.have.property('subscription');

                company.legalEntityName = 'Supernanigans, LLC';

                return company.save(function(err) {
                    should.not.exist(err);

                    company.should.have.property('legalEntityName', 'Supernanigans, LLC');

                    var result = company.subscription;

                    should.exist(subscription);

                    result.should.have.property('name', subscription.name);
                    result.should.have.property('sku', subscription.sku);

                    result.should.have.property('used', 0);
                    result.should.have.property('available', 1);
                    result.should.have.property('renews', subscription.renews);
                    result.should.have.property('status', 'active');

                    done();

                });
            });
        });
    });

	afterEach(function(done) { 
		Company.remove().exec();
		User.remove().exec();
        Subscription.remove().exec();

		done();
	});
});
