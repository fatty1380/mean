'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
    mongoose = require('mongoose'),
    _ = require('lodash'),
    Q = require('Q'),
    User = mongoose.model('User'),
    Application = mongoose.model('Application'),
    Release = mongoose.model('Release'),
    Company = mongoose.model('Company'),
    Job = mongoose.model('Job'),
    path = require('path'),
    stubs = require(path.resolve('./config/lib/test.stubs'));

/**
 * Globals
 */
var user, owner, job, company, application, application2, release;

var releasePrimitive, realReleasePrimitive, applicationPrimitive;

/**
 * Unit tests
 */
describe('Application Model Unit Tests:', function () {
    beforeEach(function (done) {

        user = new User(stubs.users.driver);
        owner = new User(stubs.users.owner);

        job = new Job({
            user: owner,
            company: company,
            name: 'Job Title Name',
            description: 'Describe Me'
        });

        company = new Company({
            owner: owner,
            name: 'My Company Name',
            type: 'owner'
        });

        applicationPrimitive = {
            'user': user,
            'job': job,
            'company': company
        };

        Q.all([user.save(), owner.save(), company.save(), job.save()]).done(function (result) {

            application = new Application(stubs.getApplication(user, company, job));

            application2 = new Application(applicationPrimitive);

            done();
        });
    });

    describe('Method Save', function () {
        it('should be able to save without problems', function (done) {
            return application.save(function (err, applicationResult) {
                should.not.exist(err);
                done();
            });
        });

        it('should be able to save without a status and without intro and default to draft',
            function (done) {

                delete applicationPrimitive.status;
                delete applicationPrimitive.introduction;

                application = new Application(applicationPrimitive);

                return application.save(function (err, applicationResult) {
                    should.not.exist(err);

                    applicationResult.should.have.property('status', 'draft');
                    applicationResult.should.have.property('isDraft', true);
                    done();
                });
            });

        it('should be able to save with a status of `draft`', function (done) {
            application.status = 'draft';

            return application.save(function (err, applicationResult) {
                should.not.exist(err);

                applicationResult.should.have.property('status', 'draft');
                applicationResult.should.have.property('isDraft', true);
                done();
            });
        });
    });

    describe('Release Model Methods', function () {

        beforeEach(function (done) {

            releasePrimitive = {
                releaseType: 'preEmployment',
                signature: {
                    dataUrl: 'data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=',
                    timestamp: '2015-04-08T03:11:39.461Z'
                },
                name: {
                    first: user.firstName,
                    middle: 'middle',
                    last: user.lastName
                },
                dob: '10/10/2001',
                releaseText: 'This is my special release!'
            };

            realReleasePrimitive = {
                'releaseType': 'preEmployment',
                'signature': {
                    'dataUrl': 'data:image/png;base64,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',
                    'timestamp': '2015-04-08T03:11:39.461Z'
                },
                'name': {
                    'first': 'p',
                    'middle': 'd',
                    'last': 'f'
                },
                'dob': '2010-10-10',
                releaseText: 'I release everything!'
            };
        });

        it('should be able to save a stand-alone, Release document without issue', function (done) {
            var release = new Release(releasePrimitive);

            return release.save(function (err) {
                should.not.exist(err);

                done();
            });
        });

        it('should be able to save a stand-alone, real-world, Release document without issue', function (done) {
            var release = new Release(realReleasePrimitive);

            return release.save(function (err) {
                should.not.exist(err);

                done();
            });
        });


        it('should be able to save with an empty list of releases', function (done) {
            application.releases = [];

            return application.save(function (err, applicationResult) {
                should.not.exist(err);

                applicationResult.releases.should.have.lengthOf(0);
                done();
            });
        });

        it('should be able to save with a primitive list of releases', function (done) {
            application.releases = [releasePrimitive];

            return application.save(function (err, applicationResult) {
                should.not.exist(err);

                should.exist(applicationResult);

                applicationResult.releases.should.have.lengthOf(1);
                applicationResult.releases[0].should.containDeep(releasePrimitive);
                done();
            });
        });

        it('should be able to save with a primitive list of releases', function (done) {
            application.releases.push(releasePrimitive);
            application.releases.push(realReleasePrimitive);

            return application.save(function (err, applicationResult) {
                should.not.exist(err);

                applicationResult.releases.should.have.lengthOf(2);
                applicationResult.releases[0].should.containDeep(releasePrimitive);
                applicationResult.releases[1].should.containDeep(realReleasePrimitive);
                done();
            });
        });

        it('should be able to save with a real list of releases', function (done) {
            application.releases = [new Release(releasePrimitive)];

            return application.save(function (err, applicationResult) {
                should.not.exist(err);

                applicationResult.releases.should.have.lengthOf(1);
                applicationResult.releases[0].toObject().should.have.properties({
                    'releaseText': releasePrimitive.releaseText,
                    'name': releasePrimitive.name,
                    'dob': releasePrimitive.dob
                });
                applicationResult.releases[0].signature
                    .should.have.property('dataUrl', releasePrimitive.signature.dataUrl);
                done();
            });
        });

        it('should be able to save with a real-world release document', function (done) {

            application.releases.should.have.lengthOf(0);

            _.map([realReleasePrimitive], function (release) {
                application.releases.push(release);
            });

            return application.save(function (err, applicationResult) {
                if (!!err) {
                    console.error('Error saving application: %j', err);
                }
                should.not.exist(err);

                console.log('APPLICATION: %j', applicationResult);
                applicationResult.releases.should.have.lengthOf(1);
                done();
            });
        });

        it('should be able to save with a real-world request document', function (done) {

            application2.releases = [releasePrimitive];

            return application2.save(function (err, applicationResult) {
                if (!!err) {
                    console.error('Error saving application2: %j', err);
                }
                should.not.exist(err);

                should.exist(applicationResult);
                applicationResult.releases.should.have.lengthOf(1);
                done();
            });
        });
    });

    afterEach(function (done) {
        Application.remove().exec();
        Job.remove().exec();
        Company.remove().exec();
        Release.remove().exec();
        User.remove().exec();

        done();
    });
});
