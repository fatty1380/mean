(function () {
    'use strict';

    //Setting up route
    angular.module('bgchecks')
        .config(BgCheckRoutes)
        .controller('ReportListController', ReportListController);

    /** ------------------------------------------ **/


    ReportListController.$inject = ['reports', 'packages', '$state', '$stateParams', 'AppConfig'];
    function ReportListController(reports, packages, $state, $stateParams, AppConfig) {
        var vm = this;

        vm.skus = $stateParams.sku;

        vm.reports = reports;
        vm.packages = packages;

        vm.faqs = AppConfig.getFaqs({ category: 'bgreport' }).then(function (vals) {

            console.log('[FAQ] promise resolved with %d vals', vals.length);

            vm.faqs = vals;
            return vals;
        });

        vm.text = {
            lead: 'Order Reports to Include with your Job Applications&hellip;',
            sub: '&hellip;and become 8-12x more likely to get the interview.'
        };

        vm.order = function (sku) {
            $state.go('orderReports', { sku: sku });
        };
    }

    resolveUser.$inject = ['LoginService', '$uibModal', '$log'];
    function resolveUser(LoginService, $uibModal, $log) {
        return LoginService.getUser()
            .then(function (user) {
                debugger;
                return user;
            })
            .catch(function (err) {
                if (!err) {
                    debugger;
                    var vm = {};

                    var modalInstance = $uibModal.open({
                        templateUrl: 'loginModal.html',
                        controller: 'LoginController',
                        resolve: {
                            srefRedirect: false
                        },
                        controllerAs: 'vm',
                        bindToController: true
                    });

                    modalInstance.opened.then(function (args) {
                        vm.isOpen = true;
                    });

                    return modalInstance.result
                        .then(
                            function (result) {
                                $log.info('Modal result %o', result);
                                vm.isOpen = false;
                                return result;
                            },
                            function (result) {
                                $log.info('Modal dismissed at: ' + new Date());
                                vm.isOpen = false;
                                return result;
                            })
                        .then(
                            function (result) {
                                debugger;
                                return LoginService.getUser();
                            });
                } else {
                    debugger;
                }
            });
    }

    resolveApplicantForUser.$inject = ['user', 'Applicants', '$q'];
    function resolveApplicantForUser(user, Applicants, $q) {
        var userId = user.id;

        if (_.isEmpty(userId)) {
            return $q.reject('Not Authenticated');
        }

        var getApplicant = Applicants.ByUser.get({ userId: userId });

        return getApplicant.$promise
            .then(
                function (result) {
                    if (!_.isEmpty(result.remoteData)) {
                        _.extend(result, result.remoteData);
                        delete result.remoteData;
                    }

                    return result;
                })
            .catch(
                function (error) {
                    debugger;
                    if (error.status === 404) {
                        console.log('No Existing Applicant for User');
                        return null;
                    }

                    console.error('Hard error %s searching for applicant: %o', error.status, error);
                    return $q.reject(error);
                });
    }

    resolveRemoteApplicantData.$inject = ['applicant', 'Applicants'];
    function resolveRemoteApplicantData(applicant, Applicants) {
        if (_.isEmpty(applicant)) {
            return {};
        }

        return Applicants.getRemoteData(applicant._id)
    }

    resolveReportDetails.$inject = ['user', 'Reports', '$stateParams'];
    function resolveReportDetails(user, Reports, $stateParams) {
        var sku = $stateParams.sku;
        return Reports.get(sku);
    }

    resolveReports.$inject = ['Reports', '$stateParams'];
    function resolveReports(Reports, $stateParams) {
        var skus = $stateParams.sku;
        return Reports.Types.list().$promise;
    }

    BgCheckRoutes.$inject = ['$stateProvider'];
    function BgCheckRoutes($stateProvider) {
        // Bgchecks state routing
        $stateProvider.
            state('listBgchecks', {
                url: '/bgchecks',
                templateUrl: '/modules/bgchecks/views/list-bgchecks.client.view.html'
            }).
            state('createBgcheck', {
                url: '/bgchecks/create',
                templateUrl: '/modules/bgchecks/views/create-bgcheck.client.view.html'
            }).
            state('editBgcheck', {
                url: '/bgchecks/:bgcheckId/edit',
                templateUrl: '/modules/bgchecks/views/edit-bgcheck.client.view.html'
            }).

            state('reviewReports', {
                url: '/reports/:sku',
                templateUrl: '/modules/bgchecks/views/review-reports.client.view.html',
                parent: 'headline-bg',
                controller: 'ReportListController',
                controllerAs: 'vm',
                bindToController: true,
                resolve: {
                    reports: resolveReports,
                    packages: ['AppConfig', function (AppConfig) {
                        return AppConfig.getReports().$promise;
                    }]
                },
                params: {
                    sku: {
                        value: null,
                        isArray: true
                    }
                }
            }).
            state('orderReports', {
                url: '/reports/:sku/order',
                templateUrl: '/modules/bgchecks/views/enter-report-data.client.view.html',
                parent: 'fixed-opaque',
                controller: 'ReportDetailsController',
                controllerAs: 'vm',
                bindToController: true,
                resolve: {
                    user: resolveUser,
                    report: resolveReportDetails,
                    applicant: resolveApplicantForUser,
                    remoteData: resolveRemoteApplicantData
                },
                params: {
                    sku: {
                        value: null,
                        isArray: true
                    }
                }
            }).
            state('bgreportview', {
                url: '/bgchecks/viewUser/:userId',
                templateUrl: '/modules/bgchecks/views/view-bgcheck.client.view.html',
                parent: 'fixed-opaque',
                controller: 'BgCheckUserController',
                controllerAs: 'vm',
                bindToController: true,
                resolve: {
                    url: function () {
                        return 'modules/bgchecks/img/defaultReport.pdf';
                    }
                }
            }).
            state('reportpayments', {
                url: '/reports/:sku/pay',
                templateUrl: '/modules/bgchecks/views/paymentTest.client.view.html',
                parent: 'fixed-opaque',
                resolve: {
                    user: resolveUser,
                    report: resolveReportDetails,
                    token: ['Payments', function (payments) {
                        var mytoken = payments.getToken();
                        return mytoken.$promise;

                    }],
                    applicant: resolveApplicantForUser,
                    company: function () { return null; }
                },
                controller: 'PaymentController',
                controllerAs: 'vm',
                bindToController: true
            });
    }

})();
