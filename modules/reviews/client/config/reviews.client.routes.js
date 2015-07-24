'use strict';

//Setting up route
angular.module('reviews').config(['$stateProvider',
	function($stateProvider) {
		// Reviews state routing
		$stateProvider.
		state('reviews', {
			abstract: true,
			url: '/reviews',
			template: '<ui-view/>'
		}).
		state('reviews.list', {
			url: '',
			templateUrl: 'modules/reviews/views/list-reviews.client.view.html'
		}).
		state('reviews.create', {
			url: '/create',
			templateUrl: 'modules/reviews/views/create-review.client.view.html'
		}).
		state('reviews.view', {
			url: '/:reviewId',
			templateUrl: 'modules/reviews/views/view-review.client.view.html'
		}).
		state('reviews.edit', {
			url: '/:reviewId/edit',
			templateUrl: 'modules/reviews/views/edit-review.client.view.html'
		});
	}
]);