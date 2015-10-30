(function () {
	'use strict';

	//Setting up route
	angular.module('reviews').config(['$stateProvider',
		function ($stateProvider) {
			// Reviews state routing
			$stateProvider.
				state('reviews', {
					abstract: true,
					url: '/reviews',
					template: '<ui-view/>',
					resolve: {
						review: function () { return null; }
					}
				}).
				state('reviews.list', {
					url: '',
					templateUrl: 'modules/reviews/views/list-reviews.client.view.html'
				}).
				state('reviews.create', {
					url: '/create?requestId',
					templateUrl: 'modules/reviews/views/create-review.client.view.html',
					controller: 'ReviewEditCtrl',
					controllerAs: 'vm',
					params: {
						requestId: {
							value: null,
							squash: true
						},
						userId: {
							value: null,
							squash: true
						}
					},
					data: {
						hideMenus: true
					},
					resolve: {
						reviewRequest: ['$log', '$stateParams', 'Requests', function ($log, $stateParams, Requests) {
							return Requests.get($stateParams.requestId)
								.catch(function fail(err) {
									$log.error(err, 'Unable to find requestId');
									return null;
								});
						}],
						profile: ['$log', '$stateParams', 'reviewRequest', 'Profiles', function ($log, $stateParams, reviewRequest, Profiles) {
							
							var profileId = reviewRequest && reviewRequest.from  || $stateParams.userId;
							
							if(!!profileId) {
								return Profiles.load(profileId)
									.catch(function fail(err) {
										$log.error(err, 'Unable to find Requesting party');
										return null;
									});
							}
							
							
						}]
					}
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
})();