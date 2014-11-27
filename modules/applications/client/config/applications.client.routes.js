'use strict';

//Setting up route
angular.module('applications').config(['$stateProvider',
    function($stateProvider) {
        // Applications state routing
        $stateProvider.

        state('applications', {
            abstract: true,
            url: '/applications',
            templateUrl: 'modules/core/views/fixed-clear.client.view.html',
            parent: 'full-opaque'
        }).

        state('applications.list', {
            url: '',
            templateUrl: 'modules/applications/views/list-applications.client.view.html'
        }).

        state('applications.mine', {
            url: '/me',
            templateUrl: 'modules/applications/views/list-applications.client.view.html'
        }).

        state('applications.create', {
            url: '/create',
            templateUrl: 'modules/applications/views/create-application.client.view.html'
        }).

        state('applications.view', {
            url: '/:applicationId',
            templateUrl: 'modules/applications/views/view-application.client.view.html'
        }).

        state('applications.edit', {
            url: '/:applicationId/edit',
            templateUrl: 'modules/applications/views/edit-application.client.view.html'
        });
    }
]);
