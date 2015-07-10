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
            applications    = apps.listByCompany(query);
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
            userId: auth.user && auth.user._id || auth.user,
            id    : auth.user.company
        };

        return jobs.listByCompany(query)
            .catch(function (err) {
                if (err.status === 404) {
                    return [];
                }
                return err;
            });
    }

    function resolveAllApplications(auth, jobs, apps) {
        if (!auth.isAdmin) {
            return resolveApplications(auth, jobs, apps);
        }

        return apps.ById.query().$promise;
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

            state('ats', {
                url             : '/ats',
                abstract        : true,
                parent          : 'fixed-opaque',
                templateUrl     : '/modules/applications/views/ats.client.view.html',
                resolve         : {
                    applications: resolveApplications,
                    config      : moduleConfigResolve
                },
                controller      : 'ApplicationListController',
                controllerAs    : 'vm',
                bindToController: true
            }).

            state('ats.root', {
                url   : '?itemId&tabName&jobId',
                views : {
                    'sidebar@ats': {
                        templateUrl     : '/modules/applications/views/templates/ats-sidebar.client.template.html',
                        controller      : 'ApplicationListController',
                        controllerAs    : 'vm',
                        bindToController: true
                    },
                    'bodycontent': {
                        templateUrl     : '/modules/applications/views/templates/job-list-content.client.template.html',
                        controller      : 'ApplicationListController',
                        controllerAs    : 'vm',
                        bindToController: true
                    }
                },
                params: {
                    companyId: {
                        default: null
                    },
                    userId   : {
                        default: null
                    }
                }
            }).

            state('ats.root.job', {
                url  : 'job',
                views: {
                    'bodycontent@ats': {
                        templateUrl     : '/modules/applications/views/templates/ats-job-details.client.template.html',
                        controller      : ['$stateParams', '$q', 'Jobs', 'Applications', function (params, $q, Jobs, Applications) {
                            var vm = this;

                            vm.applicant = null;

                            vm.loading = {
                                applicant: true
                            };

                            Jobs.get(params.jobId)
                                .then(function (job) {
                                    vm.job = job;

                                    return Applications.ByJob.query({jobId: vm.job.id}).$promise;
                                })
                                .then(function (applications) {
                                    vm.applications = applications;
                                })
                            .catch(function(err) {
                                    console.error(err);
                                })
                                .finally(function() {
                                        vm.loading.applicant = false;

                                });

                            vm.toggleApplicant = function(applicant) {
                                var tmp = vm.applicant && vm.applicant.id;

                                if(tmp !== applicant.id) {
                                    vm.applicant = applicant;
                                }
                                else {
                                    vm.applicant = null;
                                }
                            };
                        }],
                        controllerAs    : 'vm',
                        bindToController: true
                    }
                }
            }).

            state('applications', {
                abstract: true,
                url     : '/applications',
                template: '<div ui-view class="content-section something"></div>',
                parent  : 'fixed-opaque',
                params  : {
                    companyId: {
                        default: null
                    },
                    userId   : {
                        default: null
                    }
                },
                resolve : {
                    config: moduleConfigResolve
                }
            }).

            state('applications.list', {
                url             : '?itemId&tabName',
                reloadOnSearch  : false,
                templateUrl     : '/modules/applications/views/list-applications.client.view.html',
                resolve         : {
                    applications: resolveApplications
                },
                controller      : 'ApplicationListController',
                controllerAs    : 'vm',
                bindToController: true
            }).

            state('applications.all', {
                url             : 'all?itemId&tabName',
                reloadOnSearch  : false,
                templateUrl     : '/modules/applications/views/list-applications.client.view.html',
                resolve         : {
                    applications: resolveAllApplications
                },
                controller      : 'ApplicationListController',
                controllerAs    : 'vm',
                bindToController: true
            }).

            state('applications.reject', {
                url    : '/reject',
                resolve: {
                    application: ['$stateParams', 'Applications', function ($stateParams, Applications) {
                        debugger;
                    }]
                }
            }).

            state('applications.create', {
                url        : '/create',
                templateUrl: '/modules/applications/views/create-application.client.view.html'
            }).

            state('applications.view', {
                url             : '/:applicationId',
                templateUrl     : '/modules/applications/views/view-application.client.view.html',
                resolve         : {
                    application: ['$stateParams', 'Applications', function ($stateParams, Applications) {

                        var query = {
                            applicationId: $stateParams.applicationId,
                            action       : 'view'
                        };

                        return Applications.getApplication(query).catch(handle404s);
                    }]
                },
                controller      : 'ApplicationMainController',
                controllerAs    : 'vm',
                bindToController: true
            }).

            state('applications.edit', {
                url        : '/:applicationId/edit',
                templateUrl: '/modules/applications/views/edit-application.client.view.html'
            }).

            state('gateway', {
                url         : '/application?jobId',
                templateUrl : '/modules/applications/views/gateway-form.client.view.html',
                controller  : 'ApplicationGatewayController',
                controllerAs: 'vm',
                data        : {
                    hideHeader: true
                },
                params      : {
                    jobId: ''
                },
                resolve     : {
                    gateway    : ['Gateway', '$stateParams', function (Gateway, Params) {
                        return new Gateway().initialize(Params.jobId, Params.userId);
                    }],
                    resolutions: ['gateway', 'Authentication', '$stateParams', '$q', '$log', function (gateway, auth, Params, $q, $log) {

                        return $q.all({gateway: gateway, company: gateway.company, job: gateway.job})
                            .then(function (result) {
                                $log.warn('Gateway Initialized with Job `%s` and Company `%s`', result.job.name, result.company.name);
                                return result;
                            });
                    }],
                    application: ['gateway', '$q', '$timeout', function (gateway, $q, $timeout) {

                        var deferred = $q.defer();

                        var timeout = $timeout(function () {
                            deferred.resolve('timeout');
                        }, 2000);

                        gateway.application.then(function (app) {
                            $timeout.cancel(timeout);

                            deferred.resolve(app);
                        });

                        return deferred.promise;
                    }],
                    user       : ['gateway', function (gateway) {
                    }]

                }
            }).

            state('gateway.userInfo', {
                url             : '/userInfo',
                templateUrl     : '/modules/applications/views/form/user-info.client.template.html',
                controller      : '',
                controllerAs    : 'vm',
                bindToController: true
            }).

            state('gateway.driverInfo', {
                url             : '/driverInfo',
                templateUrl     : '/modules/applications/views/form/driver-info.client.template.html',
                controller      : '',
                controllerAs    : 'vm',
                bindToController: true,
                resolve         : {
                    driver: ['gateway', function (gateway) {
                        return gateway.driver;
                    }]
                }
            }).

            state('gateway.documents', {
                url             : '/documents',
                templateUrl     : '/modules/applications/views/form/documents.client.template.html',
                controller      : '',
                controllerAs    : 'vm',
                bindToController: true,
                resolve         : {
                    driver: ['gateway', function (gateway) {
                        return gateway.driver;
                    }]
                }
            }).

            state('gateway.reports', {
                url             : '/reports',
                templateUrl     : '/modules/applications/views/form/reports.client.template.html',
                controller      : '',
                controllerAs    : 'vm',
                bindToController: true,
                resolve         : {
                    applicantGateway: ['gateway', function (gateway) {
                        return gateway.applicantGateway;
                    }],
                    report          : ['gateway', function (gateway) {
                        return gateway.report;
                    }]
                }
            }).

            state('gateway.reportFields', {
                url             : '/reportFields?readonly',
                params          : {
                    readonly: false
                },
                templateUrl     : '/modules/applications/views/form/report-fields.client.template.html',
                controller      : '',
                controllerAs    : 'vm',
                bindToController: true,
                resolve         : {
                    gateway         : ['gateway', function (gateway) {
                        return gateway;
                    }],
                    report          : ['gateway', function (gateway) {
                        return gateway.report.then(function (success) {
                            console.log('resolved REPORT');
                            return success;
                        });
                    }],
                    applicant       : ['gateway', function (gateway) {
                        return gateway.applicant.then(function (success) {
                            console.log('resolved APPLICANT');
                            return success;
                        });
                    }],
                    applicantGateway: ['gateway', function (gateway) {
                        debugger;
                        return gateway.applicantGateway.then(function (success) {
                            console.log('resolved APPLICANT GATEWAY');
                            return success;
                        });
                    }]
                }
            }).

            state('gateway.authorization', {
                url             : '/authorization',
                template        : '<application-release-form gateway="vm.gw" model="vm.gw.models.release" methods="vm.subformMethods"></application-release-form>',
                controller      : '',
                controllerAs    : 'vm',
                bindToController: true,
                resolve         : {
                    requirements: ['gateway', '$q', function (gateway, $q) {
                        var gw = gateway;
                        return $q.all([gw.user, gw.release, gw.company, gw.applicantGateway, gw.application]).then(function (result) {

                        });
                    }]
                }
            }).

            state('gateway.payment', {
                url             : '/payment',
                templateUrl     : '/modules/applications/views/form/payment.client.template.html',
                controller      : '',
                controllerAs    : 'vm',
                bindToController: true
            }).

            state('gateway.complete', {
                url             : '/complete',
                templateUrl     : '/modules/applications/views/form/complete.client.template.html',
                controller      : '',
                controllerAs    : 'vm',
                bindToController: true,
                resolve         : {
                    application: ['gateway', function (gateway) {
                        return gateway.application;
                    }]
                }
            });


    }

    myJobsWithApplications.$inject = ['Authentication', 'Jobs'];
    myApplications.$inject         = ['Authentication', 'Applications'];
    resolveAllApplications.$inject = ['Authentication', 'Jobs', 'Applications'];
    resolveApplications.$inject    = ['Authentication', 'Jobs', 'Applications'];
    moduleConfigResolve.$inject    = ['AppConfig', 'Authentication'];

    config.$inject = ['$stateProvider'];

    angular.module('applications')
        .config(config);
})();
