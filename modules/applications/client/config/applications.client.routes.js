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

    function resolveApplications(Authentication, Applications, $stateParams) {

        debugger;
        var userId = _.isObject($stateParams.userId) ? Authentication.user._id : $stateParams.userId;
        var userType = _.isObject($stateParams.userId) ? Authentication.user.type : null;
        var companyId = _.isObject($stateParams.companyId) ? null : $stateParams.companyId;

        var query = {
            userId: userId
        };

        if (!!$stateParams.companyId) {
            query.companyId = companyId;
        }

        if (!!$stateParams.userType) {
            query.userType = userType;
        }

        var applications;

        if (Authentication.user.type === 'owner') {
            applications = Applications.WithJobs(query);
        }
        else if (Authentication.user.type === 'driver') {
            applications = Applications.ByUser.query(query).$promise;
        }


        return applications.catch(handle404s);
    }

    function ApplicationListController(Authentication, applications, moduleConfig) {
        var vm = this;
        vm.applications = applications;
        vm.config = moduleConfig || {};


        if (Authentication.user.type === 'driver') {
            vm.bodyCopy = {
                heading: 'Your job search, all in one place!, <em>Coming Soon!</em>',
                intro: '<p>Once we have opened the site to employers, your entire job search will be available here.</p><p>Until then, take the time to build your profile and get your reports ready.</p>',
                bullets: [
                    'The more information you provide, the better your chances',
                    'Applicants who have reports in their profile are <u>8x more likely</u> to be hired!',
                    'You always have total control over who sees your information'
                ],
                wrap: '<p>So put your best foot forward, and we’ll let you know when its time to apply!</p>',
                homeTxt: 'Back to your Profile Page'
            };

        } else if (Authentication.user.type === 'owner') {
            vm.bodyCopy = {
                heading: 'Your Applicant Tracking System, all in one place!',
                intro: '<p>Once prospective employees have applied to your jobs, this will be the center of your applicant tracking.</p>',
                bullets: [],
                wrap: '<p>So post your jobs, optimize their appearance and details, and come back here once the applications start coming in!</p>',
                homeTxt: 'Return to your Company Dashboard'
            };
        } else {
            vm.bodyCopy = {};
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
                        default: null,
                        isArray: false
                    },
                    userId: {
                        default: null,
                        isArray: false
                    }
                },
                resolve: {
                    config: moduleConfigResolve
                }
            }).

            state('applications.list', {
                url: '',
                templateUrl: 'modules/applications/views/list-applications.client.view.html',
                resolve: {
                    applications: resolveApplications
                },
                controller: 'ApplicationListController',
                controllerAs: 'vm',
                bindToController: true
            }).

            state('applications.mine', {
                url: '/me',
                templateUrl: 'modules/applications/views/list-applications.client.view.html',
                resolve: {
                    applications: myApplications
                },
                controller: 'ApplicationListController',
                controllerAs: 'vm',
                bindToController: true
            }).

            state('applications.company', {
                url: '/mine',
                templateUrl: 'modules/applications/views/list-applications.client.view.html',
                resolve: {
                    applications: myJobsWithApplications
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
    resolveApplications.$inject = ['Authentication', 'Applications', '$stateParams'];
    moduleConfigResolve.$inject = ['AppConfig', 'Authentication'];

    ApplicationListController.$inject = ['Authentication', 'applications', 'config'];

    config.$inject = ['$stateProvider'];

    angular.module('applications')
        .controller('ApplicationListController', ApplicationListController)
        .config(config);
})();
