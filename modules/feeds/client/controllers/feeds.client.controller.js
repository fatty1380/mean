'use strict';

// Feeds controller
angular.module('feeds')
.controller('FeedsController', ['$scope', '$stateParams', '$state', 'Authentication', 'Feed', 'Profiles',
	function($scope, $stateParams, $state, Authentication, Feed, Profiles ) {
		var vm = this;
		
		vm.authentication = Authentication;

		// Create new Feed
		vm.create = function() {
			// Create new Feed object
			var feedItem = new Feed.item ({
				title: vm.title,
				notes: vm.notes
			});

			// Redirect after save
			feedItem.$save(function(response) {
				$state.go('feed.list', {feedItemId: response.id});

				// Clear form fields
				vm.title = '';
				vm.notes = '';
			}, function(errorResponse) {
				vm.error = errorResponse.data.message;
			});
		};

		// Remove existing Feed
		vm.remove = function( feedItem ) {
			if ( feedItem ) { feedItem.$remove();

				for (var i in vm.feed ) {
					if (vm.feed [i] === feedItem ) {
						vm.feed.splice(i, 1);
					}
				}
			} else {
				vm.feedItem.$remove(function() {
					$state.go('feed.list');
				});
			}
		};

		// Update existing Feed
		vm.update = function() {
			var feedItem = vm.feedItem ;

			feedItem.$update(function() {
				$state.go('feed.list', {feedItemId: feedItem.id});
			}, function(errorResponse) {
				vm.error = errorResponse.data.message;
			});
		};

		// Find a list of Feed Items
		vm.find = function() {
			Feed.load().then(function(result) {
				vm.feed = result;
				
				return Profiles.lookup(result.user);
			}).then(function(feedUser) {
				vm.feed.user = feedUser;
			});
		};
		
		vm.populateItem = function (feedItem, index) {
			Feed.getItem(feedItem).then(
				function (item) {
					_.extend(vm.feed.items[index], item);

					return Profiles.lookup(item.user);
				}).then(
				function (user) {
					vm.feed.items[index].user = user;
				});
		};

		// Find existing Feed
		vm.findOne = function() {
			Feed.getItem($stateParams.feedItemId).then(
				function(item) {
					vm.feedItem = item;
					
					Profiles.lookup(item.user).then(
						function(feedUser) {
						vm.feedItem.user = feedUser;
					});
				}
			);
		};
	}
]);