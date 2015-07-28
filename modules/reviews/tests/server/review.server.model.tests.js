'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
    path = require('path'),
    _ = require('lodash'),
    Q = require('q'),
    stubs = require(path.resolve('./config/lib/test.stubs')),
    log = require(path.resolve('./config/lib/logger')).child({
        module: 'user',
        file: 'user.server.routes.test'
    });

var User = mongoose.model('User'),
	Review = mongoose.model('Review');

/**
 * Globals
 */
var user, reviewer, review;

/**
 * Unit tests
 */
describe('Review Model Unit Tests:', function () {
	beforeEach(function () {
		user = new User(stubs.user);
		reviewer = new User(stubs.getUser());

		return Q.all([user.save(), reviewer.save()])
			.then(function () {
				review = new Review({
					user: user,
					reviewer: reviewer,
					name: reviewer.shortName,
					email: reviewer.email,
					title: 'Test Review',
					text: 'Test was fantastic. Much Hurry, Very Speed, Such Deliver',
					rating: 5
				});

				return review;
			});
	});

	describe('Method Save', function () {
		it('should be able to save without problems', function (done) {
			return review.save(function (err) {
				should.not.exist(err);
				done();
			});
		});

		var requiredFields = ['user', 'title', 'rating'];

		_.each(requiredFields, function (field) {
			it('should show an error when try to save without ' + field, function (done) {
				review[field] = undefined;

				return review.save(function (err) {
					should.exist(err);
					done();
				});
			});
		});

		it('should allow saving without a reviewer', function (done) {
			review.reviewer = undefined;

			return review.save(function (err) {
				should.not.exist(err);
				done();
			});
		});
	});

	describe('The model should store', function () {

		beforeEach(function () {
			return review.save();
		});

		it('a reference to the user/driver who is being reviewed', function () {
			review.should.have.property('user');
		});
		it('an optional reference to the reviewer', function () {
			review.should.have.property('reviewer');
		});
		it('a "display name" for the reviewer', function () {
			review.should.have.property('name');
		});
		it('the reviewers email address', function () {
			review.should.have.property('email');
		});
		it('a "title" for the review', function () {
			review.should.have.property('title');
		});
		it('the text of the review', function () {
			review.should.have.property('text');
		});
		it('the rating that the reviewer left on a scale of 1 to 5', function () {
			review.should.have.property('rating');
		});
		it('a created and modified date field', function () {
			review.should.have.property('created').and.not.be.null();
			review.should.have.property('modified', review.created);
		});
	});

	describe('Business logic', function () {
		it('should set display name to the reviewer\'s \'short name\' if not set', function () {
			review.name = undefined;
			review.email = undefined;

			return review.save().then(
				function (review) {
					review.should.have.property('name', reviewer.shortName);
					review.should.have.property('email', reviewer.email);
				});
		});
	});

	afterEach(function (done) {
		Review.remove().exec(function () {
			User.remove().exec(function () {
				done();
			});
		});
	});
});
