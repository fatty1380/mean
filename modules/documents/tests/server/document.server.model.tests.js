'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	LBDocument = mongoose.model('Document');

/**
 * Globals
 */
var user, lbDocument;

/**
 * Unit tests
 */
describe('Document Model Unit Tests:', function() {
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
			lbDocument = new LBDocument({
				name: 'Document Name',
				user: user,
				url: 'data:image/png;base64:asdf1234'
			});

			done();
		});
	});

	describe('Method Save', function() {
		it('should be able to save without problems', function(done) {
			return lbDocument.save(function(err) {
				should.not.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without name', function(done) { 
			lbDocument.name = '';

			return lbDocument.save(function(err) {
				should.exist(err);
				done();
			});
		});
	});

	afterEach(function(done) { 
		LBDocument.remove().exec(function(){
			User.remove().exec(function(){
				done();
			});	
		});
	});
});
