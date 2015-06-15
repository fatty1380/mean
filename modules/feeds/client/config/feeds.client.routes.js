'use strict';

//Setting up route
angular.module('feeds').config(['$stateProvider',
	function ($stateProvider) {
		// Feeds state routing
		$stateProvider.
			state('feed', {
			abstract: true,
			url: '/feed',
			views: {
				'content@profile-base': {
					template: '<div ui-view class="content-section"></div>',
				},
				'sidebar@profile-base': {
					templateUrl: '/modules/drivers/views/templates/my-driver-sidebar.client.view.html',
					controller: ['user', 'driver', function (user, driver) {
						var vm = this;
						vm.user = user;
						vm.driver = driver;
					}],
					controllerAs: 'vm',
					bindToController: true
				}
			},
			parent: 'profile-base'
		}).
			state('feed.list', {
			url: '',
			templateUrl: 'modules/feeds/views/list-feeds.client.view.html'
		}).
			state('feed.create', {
			url: '/create',
			templateUrl: 'modules/feeds/views/create-feed.client.view.html'
		}).
			state('feed.view', {
			url: '/:feedItemId',
			templateUrl: 'modules/feeds/views/view-feed.client.view.html'
		}).
			state('feed.edit', {
			url: '/:feedItemId/edit',
			templateUrl: 'modules/feeds/views/edit-feed.client.view.html'
		});
	}
]);