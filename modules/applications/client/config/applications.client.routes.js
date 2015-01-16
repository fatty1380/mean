(function () {
    'use strict';


    function handle404s(err, $q) {
        debugger;
        // recover here if err is 404
        if (err.status === 404) {
            return null;
        } //returning recovery
        // otherwise return a $q.reject
        return $q.reject(err);
    }

    function moduleConfigResolve(AppConfig, auth) {
        return AppConfig.getModuleConfig(auth.user.type, 'applications');
    }

    function resolveApplications(Authentication, Applications, $stateParams) {

        var query = {
            userId: $stateParams.userId || Authentication.user._id,
            userType: Authentication.user.type
        };

        if (!!$stateParams.companyId) {
            query.companyId = $stateParams.companyId;
        }

        var applications = Applications.ByUser.query({
            userId: Authentication.user._id,
            userType: Authentication.user.type
        }).$promise;

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
                template: '<div ui-view class="content-section"></div>',
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
                    applications: resolveApplications
                },
                controller: 'ApplicationListController',
                controllerAs: 'vm',
                bindToController: true
            }).

            state('applications.create', {
                url: '/create',
                templateUrl: 'modules/applications/views/create-application.client.view.html'
            }).

            state('applications.view', {
                url: '/:applicationId',
                templateUrl: 'modules/applications/views/view-application.client.view.html',
                resolve: {
                    application: function ($stateParams, Applications) {
                        var promise = Applications.ById.get({
                            id: $stateParams.applicationId
                        }).$promise;

                        return promise.catch(handle404s);
                    }
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

    resolveApplications.$inject = ['Authentication', 'Applications', '$stateParams'];
    moduleConfigResolve.$inject = ['AppConfig', 'Authentication'];

    ApplicationListController.$inject = ['Authentication', 'applications', 'config'];

    config.$inject = ['$stateProvider'];

    angular.module('applications')
        .controller('ApplicationListController', ApplicationListController)
        .config(config);
})();
