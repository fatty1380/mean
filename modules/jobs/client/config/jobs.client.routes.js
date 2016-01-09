(function () {
    'use strict';

    
    config.$inject = ['$stateProvider'];
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
                    },
                    config: moduleConfigResolve
                }
            }).

            state('jobs.list', {
                parent: 'jobs',
                url: '?itemId&tabName',
                reloadOnSearch : false,
                templateUrl: '/modules/jobs/views/list-jobs.client.view.html',
                resolve: {
                    jobs: listAllResolve,
                    company: companyResolve
                },
                controller: 'JobsListController',
                controllerAs: 'vm',
                bindToController: true
            }).

            state('jobs.mine', {
                url: '/me',
                templateUrl: '/modules/jobs/views/list-jobs.client.view.html',
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
                templateUrl: '/modules/jobs/views/edit-job.client.view.html',
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
                templateUrl: '/modules/jobs/views/view-job.client.view.html',
                controller: 'JobViewController',
                controllerAs: 'vm',
                bindToController: true,
                resolve: {
                    job: jobResolve,
                    applications: getApplications
                },
                parent: 'jobs'
            }).

            state('jobs.edit', {
                url: '/:jobId/edit',
                templateUrl: '/modules/jobs/views/edit-job.client.view.html',
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
                //templateUrl: '/modules/jobs/views/list-my-jobs.client.view.html',
                parent: 'jobs'
            });
    }
    
    moduleConfigResolve.$inject = ['AppConfig', 'Authentication'];
    function moduleConfigResolve(AppConfig, auth) {
        return AppConfig.getModuleConfig(auth.user.type, 'jobs');
    }

    companyResolve.$inject = ['Companies', '$stateParams', 'Authentication', '$q'];
    function companyResolve(Companies, params, auth, $q) {
        var promise;

        if (!!params.companyId) {
            console.log('Searching for company ID: %s', params.companyId);
            promise = Companies.get(params.companyId);
        } else if (!!params.jobId) {
            console.log('Not resolving company - find it in the job');
            return null;
        } else if (!!params.userId) {
            console.log('Searching for company data for user %s', params.userId);
            promise = Companies.getByUser(params.userId);
        } else if (auth.user.type === 'owner') {
            console.log('Searching for company data for logged in user');
            promise = Companies.getByUser(auth.user._id);
        } else {
            return null;
        }

        return promise.catch(function (err) {
            // recover here if err is 404
            if (err.status === 404) {
                return null;
            } //returning recovery
            // otherwise return a $q.reject
            return $q.reject(err);
        });
    }

    jobResolve.$inject = ['Jobs', '$stateParams'];
    function jobResolve(Jobs, params) {
        var val = params.jobId;
        console.log('Searching for job ID: %s', val);

        return !!val ? Jobs.ById.get({
            id: val
        }).$promise : null;
    }

    getApplications.$inject = ['job', 'Applications'];
    function getApplications(job, Applications) {
        return Applications.ById.query({job: job._id}).$promise;
    }

    listUserResolve.$inject = ['Jobs', '$stateParams', 'Authentication', '$q'];
    function listUserResolve(Jobs, params, auth, $q) {
        var promise, p2;

        debugger;

        if (auth.user && auth.user.type === 'owner') {
            promise = Jobs.ById.query({
                user: auth.user._id,
                company: params.companyId
            }).$promise;
        } else if (auth.user) {
            promise = Jobs.ByUser.query({
                userId: auth.user._id
            }).$promise;
        } else {
            return [];
        }

        return promise
            .catch(function (err) {
            // recover here if err is 404
            if (err.status === 404) {
                return [];
            } //returning recovery
            // otherwise return a $q.reject
            return $q.reject(err);
        });
    }

    listAllResolve.$inject = ['Jobs'];
    function listAllResolve(Jobs) {
        return Jobs.ById.query().$promise;
    }


    // Dependency Injection

    //Setting up route
    angular.module('jobs').config(config);
})();
