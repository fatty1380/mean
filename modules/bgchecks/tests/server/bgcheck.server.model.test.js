'use strict';

/**
 * Module dependencies.
 */
var should   = require('should'),
    mongoose = require('mongoose'),
    User     = mongoose.model('User'),
    Bgcheck  = mongoose.model('BackgroundReport');

/**
 * Globals
 */
var user, bgcheck;

/**
 * Unit tests
 */
describe('Bgcheck Model Unit Tests:', function () {
    beforeEach(function (done) {
        user = new User({
            firstName: 'Full',
            lastName: 'Name',
            displayName: 'Full Name',
            email: 'test@test.com',
            username: 'username',
            password: 'password'
        });

        user.save(function () {
            bgcheck = new Bgcheck({
                user: user,
                remoteApplicantId: 1013,
                localReportSku: 'REPORT_SKU',
                status: 'UNKNOWN'
            });

            done();
        });
    });

    describe('Method Save', function () {
        it('should be able to save without problems', function (done) {
            return bgcheck.save(function (err) {
                if(!!err) {console.log('[ERROR] Saving bgcheck: ', err);}

                should.not.exist(err);

                done();
            });
        });

        it('should be able to show an error when try to save without user', function (done) {
            bgcheck.user = '';

            return bgcheck.save(function (err) {
                should.exist(err);
                done();
            });
        });

        it('should save with `UNKNOWN` status when status is not provided', function(done) {
            delete bgcheck.status;

            return bgcheck.save(function(err) {
                if(!!err) {console.log('[ERROR] Saving bgcheck: ', err);}
                should.not.exist(err);

                done();
            });
        });
    });

    describe('Status States and Checking', function() {

        var baseStatus;

        beforeEach(function(done) {
            baseStatus = {
                'id': 93651,
                'startDate': 1421384400000,
                'completedDate': 1421691798000,
                'applicant': {'id': 45958},
                'report': {'sku': 'MVRDOM'},
                'reportCheckStatus': {'timestamp': 1421691798000, 'status': 'SUBMITTED'}
            };

            bgcheck.save().then(function() { done();}, done);
        });

        it('should insert an incomplete status and update top level accordingly', function(done) {
            bgcheck.addStatus(baseStatus);

            bgcheck.should.have.property('status', baseStatus.reportCheckStatus.status);
            bgcheck.should.have.property('isComplete').and.be.equal(false);

            done();
        });


        it('should insert an incomplete status and update top level accordingly', function(done) {
            baseStatus.reportCheckStatus.status = 'COMPLETED';
            bgcheck.addStatus(baseStatus);

            bgcheck.should.have.property('status', baseStatus.reportCheckStatus.status);
            bgcheck.should.have.property('isComplete').and.be.equal(true);

            done();
        });

    });

    afterEach(function (done) {
        Bgcheck.remove().exec();
        User.remove().exec();

        done();
    });
});
