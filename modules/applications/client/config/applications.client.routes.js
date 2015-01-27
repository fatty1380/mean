(function () {
    'use strict';


    function handle404s(err) {
        // recover here if err is 404
        if (err.status === 404) {
            return null;
        } //returning recovery

        return err;
    }

    function moduleConfigResolve(AppConfig, auth) {
        return AppConfig.getModuleConfig(auth.user.type, 'applications');
    }

    function myApplications(auth, apps) {
        var query = {
            userId: auth.user._id
        };

        var applications;

        if (auth.user.type === 'owner') {
            query.companyId = auth.user.company || auth.user.company._id;
            applications = apps.listByCompany(query);
        } else {
            applications = apps.listByUser(query);
        }

        return applications.catch(function (err) {
            if (err.status === 404) {
                return [];
            }

            return err;
        });
    }

    function myJobsWithApplications(auth, jobs) {
        var query = {
            userId: auth.user,
            companyId: auth.user.company
        };

        return jobs.listByCompany(query).catch(function (err) {
            if (err.status === 404) {
                return [];
            }
            return err;
        });
    }

    function resolveApplications(auth, jobs, apps) {
        if(auth.user.type === 'driver') {
            return myApplications(auth, apps);
        }
        else if(auth.user.type === 'owner') {
            return myJobsWithApplications(auth, jobs);
        }
    }

    function config($stateProvider) {
        // Applications state routing
        $stateProvider.

            state('applications', {
                abstract: true,
                url: '/applications',
                template: '<div ui-view class="content-section something"></div>',
                parent: 'fixed-opaque',
                params: {
                    companyId: {
                        default: null
                    },
                    userId: {
                        default: null
                    }
                },
                resolve: {
                    config: moduleConfigResolve
                }
            }).

            state('applications.list', {
                url: '/list/:jobId?/:tabname?',
                templateUrl: 'modules/applications/views/list-applications.client.view.html',
                resolve: {
                    applications: resolveApplications
                },
                controller: 'ApplicationListController',
                controllerAs: 'vm',
                bindToController: true
            }).

            state('applications.reject', {
                url: '/reject',
                resolve: {
                    application: ['$stateParams', 'Applications', function ($stateParams, Applications) {

                    }]
                }
            }).

            state('applications.create', {
                url: '/create',
                templateUrl: 'modules/applications/views/create-application.client.view.html'
            }).

            state('applications.view', {
                url: '/:applicationId',
                templateUrl: 'modules/applications/views/view-application.client.view.html',
                resolve: {
                    application: ['$stateParams', 'Applications', function ($stateParams, Applications) {

                        var query = {
                            applicationId: $stateParams.applicationId,
                            action: 'view'
                        };

                        return Applications.getApplication(query).catch(handle404s);
                    }]
                },
                controller: 'ApplicationMainController',
                controllerAs: 'vm',
                bindToController: true
            }).

            state('applications.edit', {
                url: '/:applicationId/edit',
                templateUrl: 'modules/applications/views/edit-application.client.view.html'
            });
    }

    myJobsWithApplications.$inject = ['Authentication', 'Jobs'];
    myApplications.$inject = ['Authentication', 'Applications'];
    resolveApplications.$inject = ['Authentication', 'Jobs', 'Applications'];
    moduleConfigResolve.$inject = ['AppConfig', 'Authentication'];

    config.$inject = ['$stateProvider'];

    angular.module('applications')
        .config(config);
})();
