'use strict';

//Setting up route
angular.module('documents').config(['$stateProvider',
	function($stateProvider) {
		// Documents state routing
		$stateProvider.
		state('documents', {
			abstract: true,
			url: '/documents',
			template: '<ui-view/>'
		}).
		state('documents.list', {
			url: '',
			templateUrl: 'modules/documents/views/list-documents.client.view.html'
		}).
		state('documents.create', {
			url: '/create',
			templateUrl: 'modules/documents/views/create-document.client.view.html'
		}).
		state('documents.view', {
			url: '/:documentId',
			templateUrl: 'modules/documents/views/view-document.client.view.html'
		}).
		state('documents.edit', {
			url: '/:documentId/edit',
			templateUrl: 'modules/documents/views/edit-document.client.view.html'
		});
	}
]);