'use strict';

//Setting up route
angular.module('jobs').config(['$stateProvider',
    function($stateProvider) {
        // Jobs state routing
        $stateProvider.

        state('jobs', {
            abstract: true,
            url: '/jobs',
            template: '<div ui-view></div>',
            parent: 'fixed-opaque'
        }).

        state('jobs.list', {
            url: '',
            templateUrl: 'modules/jobs/views/list-jobs.client.view.html',
            data: {
                mode: 'list'
            },
            parent: 'jobs'
        }).

        state('jobs.mine', {
            url: '/me',
            templateUrl: 'modules/jobs/views/list-jobs.client.view.html',
            data: {
                mode: 'mine'
            },
            parent: 'jobs'
        }).

        state('jobs.create', {
            url: '/create',
            templateUrl: 'modules/jobs/views/edit-job.client.view.html',
            data: {
                mode: 'create'
            },
            parent: 'jobs'
        }).

        state('jobs.view', {
            url: '/:jobId',
            templateUrl: 'modules/jobs/views/view-job.client.view.html',
            data: {
                mode: 'view'
            },
            parent: 'jobs'
        }).

        state('jobs.edit', {
            url: '/:jobId/edit',
            templateUrl: 'modules/jobs/views/edit-job.client.view.html',
            data: {
                mode: 'edit'
            },
            parent: 'jobs'
        }).

        state('jobs.apply', {
            url: '/:jobId/apply',
            templateUrl: 'modules/jobs/views.list-my-jobs.client.view.html',
            data: {
                mode: 'apply'
            },
            parent: 'jobs'
        });
    }
]);
