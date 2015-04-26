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
    });

    afterEach(function (done) {
        Job.remove().exec();
        User.remove().exec();
        Company.remove().exec();

        done();
    });
});
