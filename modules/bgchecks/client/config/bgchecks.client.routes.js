'use strict';

//Setting up route
angular.module('bgchecks').config(['$stateProvider',
	function($stateProvider) {
		// Bgchecks state routing
		$stateProvider.
		state('listBgchecks', {
			url: '/bgchecks',
			templateUrl: 'modules/bgchecks/views/list-bgchecks.client.view.html'
		}).
		state('createBgcheck', {
			url: '/bgchecks/create',
			templateUrl: 'modules/bgchecks/views/create-bgcheck.client.view.html'
		}).
		state('viewBgcheck', {
			url: '/bgchecks/:bgcheckId',
			templateUrl: 'modules/bgchecks/views/view-bgcheck.client.view.html'
		}).
		state('editBgcheck', {
			url: '/bgchecks/:bgcheckId/edit',
			templateUrl: 'modules/bgchecks/views/edit-bgcheck.client.view.html'
		}).
			state('bgreportview', {
				url: '/bgchecks/viewUser/:userId',
				//template: '<section><embed ng-src="{{vm.content}}" style="width:200px;height:200px;"></embed><embed ng-src="{{vm.content2}}" style="width:200px;height:200px;"></embed></section>',
				templateUrl: 'modules/bgchecks/views/view-bgcheck.client.view.html',
				parent: 'fixed-opaque',
				controller: 'BgCheckUserController',
				controllerAs: 'vm',
				bindToController: true,
				resolve : {
					url : function() {
						return 'modules/bgchecks/img/defaultReport.pdf';
					}
				}
			})
		;
	}
]);
