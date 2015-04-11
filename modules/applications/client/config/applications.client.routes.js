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
                },
                resolve: {
                    gateway: ['Gateway', 'Authentication', '$stateParams', '$q', function(Gateway, auth, Params, $q) {
                        return Gateway.initialize(Params.jobId, auth.user).then(function(result) {
                            return $q.all([Gateway.company, Gateway.job])

                        }).then(function(result) {
                            debugger
                        });

                    }]
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
                    driver: ['Gateway', function (Gateway) {
                        return Gateway.driver;
                    }]
                }
            }).

            state('gateway.documents', {
                url: '/documents',
                templateUrl: '/modules/applications/views/form/documents.client.template.html',
                controller: '',
                controllerAs: 'vm',
                bindToController: true,
                resolve: {
                    driver: ['Gateway', function (Gateway) {
                        return Gateway.driver;
                    }]
                }
            }).

            state('gateway.reports', {
                url: '/reports',
                templateUrl: '/modules/applications/views/form/reports.client.template.html',
                controller: '',
                controllerAs: 'vm',
                bindToController: true,
                resolve: {
                    applicantGateway: ['Gateway', function (Gateway) {
                        debugger;
                        return Gateway.applicantGateway;
                    }],
                    report: ['Gateway', function (Gateway) {
                        debugger;
                        return Gateway.report;
                    }]
                }
            }).

            state('gateway.reportFields', {
                url: '/reportFields?readonly',
                params: {
                    readonly: false
                },
                templateUrl: '/modules/applications/views/form/report-fields.client.template.html',
                controller: '',
                controllerAs: 'vm',
                bindToController: true,
                resolve: {
                    report: ['Gateway', function (Gateway) {
                        return Gateway.report;
                    }],
                    applicant: ['Gateway', function (Gateway) {
                        return Gateway.applicant;
                    }]
                }
            }).

            state('gateway.authorization', {
                url: '/authorization',
                template: '<application-release-form model="vm.gw.models.release" methods="vm.subformMethods"></application-release-form>',
                controller: '',
                controllerAs: 'vm',
                bindToController: true,
                resolve: {
                    requirements: ['Gateway', '$q', function (gw, $q) {
                        return $q.all([gw.user, gw.release, gw.company, gw.applicantGateway, gw.application]).then(function (result) {
                            debugger;
                        });
                    }]
                }
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
                bindToController: true,
                resolve: {
                    applicant: ['Gateway', function (Gateway) {
                        return Gateway.applicant;
                    }]
                }
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
