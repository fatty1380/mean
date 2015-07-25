'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Review = mongoose.model('Review');

/**
 * Globals
 */
var user, review;

/**
 * Unit tests
 */
describe('Review Model Unit Tests:', function() {
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
			review = new Review({
				name: 'Review Name',
				user: user
			});

			done();
		});
	});

	describe('Method Save', function() {
		it('should be able to save without problems', function(done) {
			return review.save(function(err) {
				should.not.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without name', function(done) { 
			review.name = '';

			return review.save(function(err) {
				should.exist(err);
				done();
			});
		});
	});
	
	describe('The model should store', function () {
		it('a reference to the user/driver who is being reviewed');
		it('an optional reference to the reviewer');
		it('a "display name" for the reviewer');
		it('the reviewers email address');
		it('a "title" for the review');
		it('the text of the review');
		it('the rating that the reviewer left on a scale of 1 to 5');
		it('a created and modified date field');
	});
	
	describe('Business logic', function () {
		it('should set display name to the reviewer\'s email if not set');
		
	})

	afterEach(function(done) { 
		Review.remove().exec(function(){
			User.remove().exec(function(){
				done();
			});	
		});
	});
});
