(function () {
    'use strict';



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

        // AppConfig.getReports().$promise.then(function(reportResponse) {
        //     debugger;
        //     vm.packages = reportResponse;
        // });
    }

    function resolveApplicantForUser(Applicants, Authentication, $q) {
        var userId = Authentication.user._id;
        var getApplicant = Applicants.ByUser.get({ userId: userId });

        return getApplicant.$promise.catch(
            function (error) {
                if (error.status === 404) {
                    console.log('No Existing Applicant for User');
                    return null;
                }

                console.error('Hard error %s searching for applicant: %o', error.status, error);
                return $q.reject(error);
            }
            );
    }

    function resolveReportDetails(Reports, $stateParams) {
        var sku = $stateParams.sku;

        debugger;
        return Reports.get(sku);
    }

    function resolveReports(Reports, $stateParams) {
        var skus = $stateParams.sku;
        return Reports.Types.list().$promise;
    }

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
                    report: resolveReportDetails,
                    applicant: resolveApplicantForUser
                },
                params: {
                    sku: {
                        default: null,
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

    BgCheckRoutes.$inject = ['$stateProvider'];

    resolveApplicantForUser.$inject = ['Applicants', 'Authentication', '$q'];
    resolveReports.$inject = ['Reports', '$stateParams'];
    resolveReportDetails.$inject = ['Reports', '$stateParams'];

    //Setting up route
    angular.module('bgchecks')
        .config(BgCheckRoutes)
        .controller('ReportListController', ReportListController);

})();
