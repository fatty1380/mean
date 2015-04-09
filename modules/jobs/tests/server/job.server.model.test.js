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
        var userPrimative = {
            firstName: 'Full',
            lastName: 'Name',
            email: 'test@test.com',
            username: 'username',
            password: 'password',
            provider: 'local',
            type: 'driver'
        };

        user = new User(userPrimative);
        owner = new User(_.extend(_.clone(userPrimative, true), {firstName: 'Joe', lastName: 'Owner', type: 'owner'}));

        company = new Company({
            owner: owner,
            name: 'My Company Name',
            type: 'owner'
        });

        Q.all([user.save(), owner.save(), company.save()]).done(function (result) {
                job = new Job({
                    user: owner,
                    company: company,
                    name: 'Job Title Name',
                    description: 'Describe Me'
                });

                done();
        });
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

        done();
    });
});
