'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	Q = require('q'),
	_ = require('lodash');

var mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Feed = mongoose.model('Feed'),
	FeedItem = mongoose.model('FeedItem');

/**
 * Globals
 */
var user, feed;

/**
 * Unit tests
 */
describe('Feed Model Unit Tests:', function () {
	beforeEach(function (done) {
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: 'username',
			password: 'password'
		});

		user.save(function() { 
			feed = new Feed({
				name: 'Feed Name',
				user: user
			});

			done();
		});
	});

	describe('Method Save', function() {
		it('should be able to save without problems', function () {
			return feed.save().then(function success(result) {
				result.should.have.property('id', user.id);
			}, function reject(err) {
				should.not.exist(err);
			});
		});

		it('should be able to show an error when try to save without user', function () {
			feed.user = null;

			return feed.save().then(function success(result) {
				should.not.exist(result);
			}, function (err) {
				should.exist(err);
			});
		});
	});

	describe('Feed Activites', function () {
		var activity;

		beforeEach(function () {
			return feed.save().then(function success(result) {
				activity = new FeedItem({
					title: 'Title',
					message: 'This is my message',
					location: {
						coordinates: [37.4422623, -122.143102]
					}
				});
			}, function (err) {
				should.not.exist(err);
			});
		})
		it('should be able to save a simple location', function () {
			return activity.save().then(
				function success(result) {
					console.log('============================================', result.toJSON());
					result.should.have.property('location');
				});
		});

		// describe('Migration', function () {
		// 	beforeEach(function (done) {
		// 		FeedItem.collection.insert({
		// 			title: 'Title',
		// 			message: 'this is a special message',
		// 			location: [{
		// 				coordinates: [37.4422623, -122.143102]
		// 			}]
		// 		}, {}, function () {
		// 			done();
		// 		})
		// 	})

		// 	it('should load legacy location properly', function () {
		// 		return FeedItem.find({message: 'this is a special message'}).then(function success(result) {


		// 			console.log('===========================================', result);
		// 			result.should.be.Array.and.have.length(1);

		// 			result[0].should.have.property('location');
		// 			result[0].should.have.property('_location');
		// 		})
		// 	})
		// })
	})

	afterEach(function(done) { 
		FeedItem.remove().exec(function () {
		Feed.remove().exec(function(){
			User.remove().exec(function(){
				done();
			});	
		});
	});
});

});
