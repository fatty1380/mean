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
        if (auth.user.type === 'driver') {
            return myApplications(auth, apps);
        }
        else if (auth.user.type === 'owner') {
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
                url: '?itemId&tabName',
                reloadOnSearch: false,
                templateUrl: '/modules/applications/views/list-applications.client.view.html',
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
                        debugger;
                    }]
                }
            }).

            state('applications.create', {
                url: '/create',
                templateUrl: '/modules/applications/views/create-application.client.view.html'
            }).

            state('applications.view', {
                url: '/:applicationId',
                templateUrl: '/modules/applications/views/view-application.client.view.html',
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
                templateUrl: '/modules/applications/views/edit-application.client.view.html'
            }).

            state('gateway', {
                url: '/application?jobId',
                templateUrl: '/modules/applications/views/gateway-form.client.view.html',
                controller: 'ApplicationGatewayController',
                controllerAs: 'vm',
                data: {
                    formData: {}
                },
                params: {
                    jobId: ''
                }
            }).

            state('gateway.userInfo', {
                url: '/userInfo',
                templateUrl: '/modules/applications/views/form/user-info.client.template.html',
                controller: '',
                controllerAs: 'vm',
                bindToController: true
            }).

            state('gateway.driverInfo', {
                url: '/driverInfo',
                templateUrl: '/modules/applications/views/form/driver-info.client.template.html',
                controller: '',
                controllerAs: 'vm',
                bindToController: true,
                resolve: {
                    driver: ['Gateway', function(gw) {
                        return gw.driver;
                    }]
                }
            }).

            state('gateway.documents', {
                url: '/documents',
                templateUrl: '/modules/applications/views/form/documents.client.template.html',
                controller: '',
                controllerAs: 'vm',
                bindToController: true
            }).

            state('gateway.reports', {
                url: '/reports',
                templateUrl: '/modules/applications/views/form/reports.client.template.html',
                controller: '',
                controllerAs: 'vm',
                bindToController: true
            }).

            state('gateway.reportFields', {
                url: '/reportFields?readonly',
                params: {
                    readonly: false
                },
                templateUrl: '/modules/applications/views/form/report-fields.client.template.html',
                //controller: function ($scope, $state, report, applicant) {
                //    var vm = this;
                //    var parent = $scope.$parent.vm;
                //    // todo: check report, applicant and vm.formData.applicant
                //
                //    parent.formData.report = _.defaults(parent.formData.report, report);
                //    parent.formData.applicant = _.defaults(parent.formData.applicant, applicant);
                //
                //    vm.formData = parent.formData;
                //    vm.subformMethods = parent.subformMethods;
                //
                //    debugger;
                //},
                controller: '',
                controllerAs: 'vm',
                bindToController: true,
                //resolve: {
                //    report: function (Reports) {
                //        var sku = sku || 'OUTSET_MVR';
                //
                //        return Reports.get(sku).then(
                //            function (reportDetails) {
                //                return reportDetails;
                //            })
                //            .catch(function (error) {
                //                console.error('Problem getting report `%s`: %s', sku, error);
                //                return {};
                //            });
                //    },
                //    applicant: function (Applicants, Authentication, $q) {
                //        var userId = Authentication.user._id;
                //        var getApplicant = Applicants.ByUser.get({userId: userId});
                //
                //        return getApplicant.$promise.catch(
                //            function (error) {
                //                if (error.status === 404) {
                //                    console.log('No Existing Applicant for User');
                //                    return null;
                //                }
                //
                //                console.error('Hard error %s searching for applicant: %o', error.status, error);
                //                return $q.reject(error);
                //            }
                //        );
                //    }
                //}
            }).

            state('gateway.authorization', {
                url: '/authorization',
                templateUrl: '/modules/applications/views/form/authorization.client.template.html',
                controller: '',
                controllerAs: 'vm',
                bindToController: true
            }).

            state('gateway.payment', {
                url: '/payment',
                templateUrl: '/modules/applications/views/form/payment.client.template.html',
                controller: '',
                controllerAs: 'vm',
                bindToController: true
            }).

            state('gateway.complete', {
                url: '/complete',
                templateUrl: '/modules/applications/views/form/complete.client.template.html',
                controller: '',
                controllerAs: 'vm',
                bindToController: true
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
