(function () {
    'use strict';

    function handle404s(err, $q) {
        // recover here if err is 404
        if (err.status === 404) {
            return null;
        } //returning recovery
        // otherwise return a $q.reject
        return $q.reject(err);
    }

    function companyResolve(rsrc, params, auth) {
        var promise;

        if (!!params.companyId) {
            var val = params.companyId;
            console.log('Searching for company ID: %s', val);

            promise = rsrc.ById.get({
                companyId: val
            }).$promise;
        } else if (!!params.jobId) {
            console.log('Not resolving company - find it in the job');
            return null;
        } else if (!!params.userId) {
            console.log('Searching for company data for user %s', params.userId);
            promise = rsrc.ByUser.get({
                userId: params.userId
            }).$promise;
        } else {
            console.log('Searching for company data for logged in user');
            promise = rsrc.ByUser.get({
                userId: auth.user._id
            }).$promise;
        }

        return promise.catch(handle404s);
    }

    function jobResolve(rsrc, params) {
        var val = params.jobId;
        console.log('Searching for job ID: %s', val);

        return !!val ? rsrc.ById.get({
            jobId: val
        }).$promise.catch(handle404s) : null;
    }

    function listUserResolve(rsrc, params, auth) {
        var promise;

        if (auth.user && auth.user.type === 'owner') {
            promise = rsrc.ByUser.query({
                userId: auth.user._id,
                companyId: params.companyId
            }).$promise;
        } else if (auth.user) {
            promise = rsrc.ByUser.query({
                userId: auth.user._id
            }).$promise;
        } else {
            return [];
        }

        return promise.catch(handle404s);
    }

    function listAllResolve(rsrc) {
        return rsrc.ById.query().$promise;
    }

    function config($stateProvider) {
        // Jobs state routing
        $stateProvider.

            state('jobs', {
                abstract: true,
                url: '/jobs',
                template: '<div ui-view class="content-section"></div>',
                parent: 'fixed-opaque',
                resolve: {
                    job: function () {
                    },
                    jobs: function () {
                    },
                    company: function () {
                    }
                }
            }).

            state('jobs.list', {
                url: '',
                templateUrl: 'modules/jobs/views/list-jobs.client.view.html',
                controller: 'JobsListController',
                controllerAs: 'vm',
                bindToController: true,
                resolve: {
                    jobs: listAllResolve
                },
                parent: 'jobs'
            }).

            state('jobs.mine', {
                url: '/me',
                templateUrl: 'modules/jobs/views/list-jobs.client.view.html',
                controller: 'JobsListController',
                controllerAs: 'vm',
                bindToController: true,
                resolve: {
                    jobs: listUserResolve,
                    company: companyResolve
                },
                parent: 'jobs'
            }).

            state('jobs.create', {
                url: '/create/:companyId',
                templateUrl: 'modules/jobs/views/edit-job.client.view.html',
                controller: 'JobEditController',
                controllerAs: 'vm',
                bindToController: true,
                resolve: {
                    company: companyResolve
                },
                parent: 'jobs'
            }).

            state('jobs.view', {
                url: '/:jobId',
                templateUrl: 'modules/jobs/views/view-job.client.view.html',
                controller: 'JobViewController',
                controllerAs: 'vm',
                bindToController: true,
                resolve: {
                    job: jobResolve
                },
                parent: 'jobs'
            }).

            state('jobs.edit', {
                url: '/:jobId/edit',
                templateUrl: 'modules/jobs/views/edit-job.client.view.html',
                controller: 'JobEditController',
                controllerAs: 'vm',
                bindToController: true,
                resolve: {
                    job: jobResolve
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
    companyResolve.$inject = ['Companies', '$stateParams', 'Authentication'];
    jobResolve.$inject = ['Jobs', '$stateParams', 'Authentication'];
    listUserResolve.$inject = ['Jobs', '$stateParams', 'Authentication'];
    listAllResolve.$inject = ['Jobs'];
    config.$inject = ['$stateProvider'];

    //Setting up route
    angular.module('jobs').config(config);
})();
