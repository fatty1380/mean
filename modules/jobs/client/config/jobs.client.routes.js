(function() {
    'use strict';

    function company_resolve(rsrc, params, auth) {
        if (!!params.companyId) {
            var val = params.companyId;
            console.log('Searching for company ID: %s', val);

            return rsrc.ById.get({
                companyId: val
            }).$promise;
        } else if (!!params.jobId) {
            console.log('Not resolving company - find it in the job');
        } else if (!!params.userId) {
            console.log('Searching for company data for user %s', params.userId);
            return rsrc.ByUser.get({
                userId: params.userId
            }).$promise;
        } else {
            console.log('Searching for company data for logged in user');
            return rsrc.ByUser.get({
                userId: auth.user._id
            }).$promise;
        }
        return {};
    }

    function job_resolve(rsrc, params) {
        var val = params.jobId;
        console.log('Searching for job ID: %s', val);

        return !!val ? rsrc.ById.get({
            jobId: val
        }).$promise : null;
    }

    function list_user_resolve(rsrc, params, auth) {
        if (auth.user && auth.user.type === 'owner') {
            return rsrc.ByUser.query({
                userId: auth.user._id,
                companyId: params.companyId
            }).$promise;
        } else if (auth.user) {
            return rsrc.ById.query().$promise;
        } else {
            return [];
        }
    }

    function config($stateProvider) {
        // Jobs state routing
        $stateProvider.

        state('jobs', {
            abstract: true,
            url: '/jobs',
            template: '<div ui-view></div>',
            parent: 'fixed-opaque',
            resolve: {
                job: function() {},
                jobs: function() {},
                company: function() {},
            }
        }).

        state('jobs.list', {
            url: '',
            templateUrl: 'modules/jobs/views/list-jobs.client.view.html',
            controller: 'JobsController',
            resolve: {
                jobs: list_user_resolve
            },
            parent: 'jobs'
        }).

        state('jobs.mine', {
            url: '/me',
            templateUrl: 'modules/jobs/views/list-jobs.client.view.html',
            controller: 'JobsController',
            resolve: {
                jobs: list_user_resolve,
                company: company_resolve
            },
            parent: 'jobs'
        }).

        state('jobs.create', {
            url: '/create/:companyId',
            templateUrl: 'modules/jobs/views/edit-job.client.view.html',
            controller: 'JobsController',
            resolve: {
                company: company_resolve
            },
            parent: 'jobs'
        }).

        state('jobs.view', {
            url: '/:jobId',
            templateUrl: 'modules/jobs/views/view-job.client.view.html',
            controller: 'JobsController',
            resolve: {
                job: job_resolve
            },
            parent: 'jobs'
        }).

        state('jobs.edit', {
            url: '/:jobId/edit',
            templateUrl: 'modules/jobs/views/edit-job.client.view.html',
            controller: 'JobsController',
            resolve: {
                job: job_resolve
            },
            parent: 'jobs'
        }).

        state('jobs.apply', {
            url: '/:jobId/apply',
            //templateUrl: 'modules/jobs/views/list-my-jobs.client.view.html',
            parent: 'jobs'
        });
    }


    // Dependency Injection
    company_resolve.$inject = ['Companies', '$stateParams', 'Authentication'];
    job_resolve.$inject = ['Jobs', '$stateParams', 'Authentication'];
    list_user_resolve.$inject = ['Jobs', '$stateParams', 'Authentication'];
    config.$inject = ['$stateProvider'];

    //Setting up route
    angular.module('jobs').config(config);
})();
