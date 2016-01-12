'use strict';

var should = require('should'),
    _ = require('lodash'),
    Q = require('q'),
    path = require('path'),
    stubs = require(path.resolve('./config/lib/test.stubs')),
    moment = require('moment'),
    log = require(path.resolve('./config/lib/logger')).child({
        module: 'tests',
        file: 'luceo.service'
    });


var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Driver = mongoose.model('Driver'),
    Company = mongoose.model('Company'),
    Job = mongoose.model('Job');
	
// ** CONTROLLER TEST IMPORTS ** //
var Luceo = require(path.resolve('./modules/ats/server/services/luceo.server.service.js'));

var supertest = require('supertest-as-promised')(Q.Promise);
_.isUndefined(supertest).should.not.be.true;

/**
 * Globals
 */

var _test, endpoint;

describe('Luceo Applicant Tests', function () {

    var user;
    
    var STATIC_CANDIDATE_ID = '89883';
    var STATIC_REQUISITION_ID = '1582'; // https://ws-core-mark.luceosolutions.com/rest/position/1582/
    
    /// Setup
    before(function () {
        log.trace({ func: 'beforeAll' }, 'Setup Base');

        return Q.when(true);
    });

    beforeEach(function () {
        _test = this.currentTest;
        log.trace({ func: this.test.title, test: _test.title }, 'Setup');
        
        // Create user and credentials
        user = new Driver(stubs.user);
        
        user.addresses = [{
            streetAddresses: ["123 Fake St."],
            city: 'Fakeville',
            state: 'AK',
            zipCode: '44344'
        }];
        
        user.experience = [{
            title: 'Job Experience 1',
            description: 'This was a great job',
            company: 'TestMan Trucking, inc.',
            startDate: moment('2010-02-01').format('MM/DD/YYYY'),
            endDate: moment('2014-02-01').format('MM/DD/YYYY'),
            location: 'Testerville, AK'
        }];

        return Q.all([user.save()]);
    });
    
    /// Tests
    
    it.skip('should be able to search for applicants', function () {
        this.timeout(10000);
        return Luceo.applicant.list()
            .then(function examineResults(resultObject) {
                should.exist(resultObject);
                
                resultObject.should.have.property('recordCount');
                resultObject.should.have.property('page', 1);
                resultObject.should.have.property('pageCount');
                resultObject.should.have.property('result').and.be.Array;
            });
    });
    
    it('should be able to load a single remote applicant', function () {
        return Luceo.applicant.get(STATIC_CANDIDATE_ID)
            .then(function examineResults(resultApplicant) {
                log.debug({ test: _test.title, response: resultApplicant }, 'Got Remote Applicant');
                should.exist(resultApplicant);

                resultApplicant.should.have.property('firstName').and.not.be.empty;
                resultApplicant.should.have.property('lastName').and.not.be.empty;
            });
    });

    it('should be able to create a new applicant', function () {
        return Luceo.applicant.create(user)
            .then(function examineApplicant(remoteApplicant) {
                log.debug({ test: _test.title, response: remoteApplicant }, 'Got Remote Applicant');
                should.exist(remoteApplicant);
                remoteApplicant.should.be.Object;

                remoteApplicant.should.have.property('id').and.be.String;
                remoteApplicant.should.have.property('reference').and.be.String;
                remoteApplicant.should.have.property('assignmentid').and.be.String;
                remoteApplicant.should.have.property('link').and.be.String;
                
                remoteApplicant.link.should.startWith('https://');

                return Luceo.applicant.get(remoteApplicant.id);
            })
            .then(function verifyApplicant(remoteApplicant) {
                log.debug({ test: _test.title, response: remoteApplicant }, 'Got Remote Applicant Details');
                should.exist(remoteApplicant);
                remoteApplicant.should.be.Object;

                remoteApplicant.should.have.property('id').and.be.String;
                remoteApplicant.should.have.property('email').and.be.String;
                remoteApplicant.should.have.property('address').and.be.String;
                remoteApplicant.should.have.property('employments').and.be.Object;
                
                remoteApplicant.employments.should.have.property('link');
            })
            .catch(catchLogAndThrow);
    });
    
    it('should be able to update experience for a user');

    it('should be able to update an existing applicant', function () {

    });

    it('should be able to create an application to a pre-defined job requisition', function () {
        
        var owner = new User(stubs.owner);
        var company = new Company(stubs.getCompany(owner));
        var job = new Job(stubs.getJob(owner, company));
        
        job.remoteSystem = 'luceo';
        job.remoteSystemId = STATIC_REQUISITION_ID;
        
        return Q.all([owner.save(), company.save(), job.save()])
            .then(function (results) {

                return Luceo.application.create(STATIC_CANDIDATE_ID, job);
            })
            .then(function examine(application) {
                log.debug({ test: _test.title, response: application }, 'Got Remote Applicant');
                should.exist(application);
                application.should.be.Object;

                application.should.have.property('id').and.be.String;
                application.should.have.property('created').and.be.String;
                application.should.have.property('link').and.be.String;
                
                application.link.should.startWith('https://');
            }); 
    });
    
    
    /// Cleanup 
    afterEach(function () {
        log.trace({ func: this.test.title, test: _test.title }, 'Teardown');

        return stubs.cleanTables([Driver]);
    });


    after(function () {
        log.trace({ func: 'afterAll' }, 'All Tests Complete');

        return Q.when(true);
    });
});


function catchLogAndThrow(err) {
    log.error({ test: _test.title, err: err }, 'Test Failed with Error');

    throw err;
}
