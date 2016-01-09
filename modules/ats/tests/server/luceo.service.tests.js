'use strict';

var should = require('should'),
	_ = require('lodash'),
	Q = require('q'),
	path = require('path'),
	stubs = require(path.resolve('./config/lib/test.stubs')),
    log = require(path.resolve('./config/lib/logger')).child({
        module: 'tests',
        file: 'luceo.service'
    });
	
// ** CONTROLLER TEST IMPORTS ** //
var Luceo = require(path.resolve('./modules/core/server/services/luceo.server.service.js'));

var supertest = require('supertest-as-promised')(Q.Promise);
_.isUndefined(supertest).should.not.be.true;

/**
 * Globals
 */

var _test, endpoint;

describe('Luceo Applicant Tests', function () {
    
    /// Setup
    before(function () {
		log.trace({ func: 'beforeAll' }, 'Setup Base');

		return Q.when(true);
	});

	beforeEach(function () {
		_test = this.currentTest;
		log.trace({ func: this.test.title, test: _test.title }, 'Setup');

		return Q.when(true);
    });
    
    /// Tests
    
    it('should be able to search for applicants', function (done) {
        
    });    
    
    it('should be able to create a new applicant', function (done) {
        
    });   
    
    it('should be able to update an existing applicant', function (done) {
        
    });
    
    it('should be able to create an application to a pre-defined job requisition', function (done) {
        
    });
    
    
    /// Cleanup 
	afterEach(function () {
		log.trace({ func: this.test.title, test: _test.title }, 'Teardown');

		return Q.when(true);
	});


	after(function () {
		log.trace({ func: 'afterAll' }, 'All Tests Complete');

		return Q.when(true);
	});
});

