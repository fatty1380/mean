'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	User = mongoose.model('User');

/**
 * Globals
 */
var user, user2;

/**
 * Unit tests
 */
describe('User Model Unit Tests:', function() {
	before(function(done) {
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: 'username',
			password: 'password',
			provider: 'local'
		});
		user2 = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: 'username',
			password: 'password',
			provider: 'local'
		});

		done();
	});

	describe('Method Save', function() {
		it('should begin with no users', function(done) {
			User.find({}, function(err, users) {
				users.should.have.length(0);
				done();
			});
		});

		it('should be able to save without problems', function(done) {
			user.save(done);
		});

		it('should fail to save an existing user again', function(done) {
			user.save();
			return user2.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without first name', function(done) {
			user.firstName = '';
			return user.save(function(err) {
				should.exist(err);
				done();
			});
		});

        it('should be able to show an error when try to save without last name', function(done) {
            user.lastName = '';
            return user.save(function(err) {
                should.exist(err);
                done();
	});
        });

        it('should use an email in place of username when username is not provided');
        it('should create an empty driver profile when a \'driver\' type is created');
        it('should create an empty company profile when an \'owner\' type is created');
        it('should allow both a driver and company profile to exist');
        it('should be able to save an address to this user');
        it('should be able to save multiple addresses');
        it('should be able to mark a single address as the primary address');

        describe('Disabling a User', function() {
            it('should disable any driver records associated with the user');
            it('should disable any company records where the user is the only associated user');
            it('should NOT disable any company records where the user is NOT the only associated user');
        });
    });

    describe('Method Update(?)', function() {
        it('should begin with users?');
    });

    describe('Method remove', function() {
        it('should remove any driver records associated with the user');
        it('should remove any company records where the user is the only associated user');
        it('should keep any company records where the user is NOT the only associated user');
    });

	after(function(done) {
		User.remove().exec();
		done();
	});
});
