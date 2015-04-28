'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
mongoose   = require('mongoose'),
_          = require('lodash'),
Q          = require('Q'),
User       = mongoose.model('User'),
Job        = mongoose.model('Job'),
Company    = mongoose.model('Company');

/**
 * Globals
 */
var user, owner, company, job;

/**
 * Unit tests
 */
describe('Job Model Unit Tests:', function () {
    beforeEach(function (done) {

        user = new User({
            firstName: 'Full',
            lastName: 'Name',
            email: 'test@test.com',
            username: 'username',
            password: 'password',
            provider: 'local',
            type: 'driver'
        });

        user.save()
            .then(function (user) {
                console.log('Saved User');

                owner = new User({
                    firstName: 'Joe',
                    lastName: 'Owner',
                    email: 'test@test.com',
                    username: 'ownername',
                    password: 'password',
                    provider: 'local',
                    type: 'owner'
                });

                return owner.save();
            })
            .then(function (owner) {
                console.log('saved Owner');

                company = new Company({
                    owner: owner,
                    name: 'My Company Name',
                    type: 'owner'
                });

                return company.save();
            })
            .then(function (company) {
                console.log('saved company');

                return;
            })
            .then(function () {
                console.log('initing job');

                job = new Job({
                    user: owner,
                    company: company,
                    name: 'Job Title Name',
                    description: 'Describe Me'
                });

                done();
            })
            .end();
    });

    describe('Method Save', function () {
        it('should be able to save without problems', function (done) {
            return job.save(function (err) {
                should.not.exist(err);
                done();
            });
        });

        it('should be able to show an error when try to save without name', function (done) {
            job.name = '';

            return job.save(function (err) {
                should.exist(err);
                done();
            });
        });

        it('should interpret an empty Address as an `empty` address with the corret virtuals', function(done) {
            var proto = {};
            job.location = [proto];

            return job.save(function (err) {
                should.not.exist(err);

                job.should.have.property('location').with.length(1);

                var loc = job.location[0];

                should.exist(loc);

                loc.should.have.property('zipOnly', false);
                loc.should.have.property('empty', true);
                loc.should.have.property('type', 'main');

                done();
            });
        });


        it('should be able to save with a POJO address', function (done) {
            var proto = {city: 'Laramie', state: 'WY'};
            job.location = [proto];

            return job.save(function (err) {
                should.not.exist(err);

                job.should.have.property('location').with.length(1);

                var loc = job.location[0];

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
            job.location = [proto];

            return job.save(function (err) {
                should.not.exist(err);

                job.should.have.property('location').with.length(1);

                proto = {city: 'Seattle', state: 'WA', zipCode: '98011'};
                job.location = [proto];

                return job.save(function(err) {
                    should.not.exist(err);

                    var loc = job.location[0];

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

    afterEach(function (done) {
        Job.remove().exec();
        User.remove().exec();
        Company.remove().exec();

        done();
    });
});
