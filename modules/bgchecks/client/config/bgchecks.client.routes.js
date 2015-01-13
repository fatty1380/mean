(function () {
    'use strict';



    /** ------------------------------------------ **/

    function ReportListController(reports, $stateParams, AppConfig) {
        var vm = this;

        vm.skus = $stateParams.sku;

        vm.reports = reports;

        vm.faqs = AppConfig.getFaqs({category: 'bgreport'}).then(function (vals) {

            console.log('[FAQ] promise resolved with %d vals', vals.length);

            vm.faqs = vals;
            return vals;
        });

        vm.packages = AppConfig.getReports() || {
            base: {
                title: 'Motor Vehicle Report',
                price: '5',
                sku: 'MVRDOM',
                skus: ['MVRDOM'],
                enabled: true
            },
            good: {
                title: 'Good',
                price: '14.50',
                sku: 'NBDS+MVRDOM',
                skus: [{sku: 'NBDS'}, {sku: 'MVRDOM'}],
                enabled: true
            },
            better: {
                title: 'Premium',
                price: '44.95',
                sku: 'PKG_PREMIUM',
                skus: [{sku: 'PKG_PREMIUM', subsku: ['SSNVAL', 'CRIMESC', 'FORM_EVER']}],
                enabled: true
            },
            best: {
                title: 'Enterprise',
                price: '84.95',
                sku: 'PKG_PREMIUM+ES_ECUPIT',
                skus: [{sku: 'ES_ECUPIT'}, {sku: 'PKG_PREMIUM', subsku: ['SSNVAL', 'CRIMESC', 'FORM_EVER']}],
                enabled: true
            },
            drugs: {
                title: 'Drug Test',
                price: '40',
                sku: 'ES_ECUPIT',
                enabled: false
            }
        };
    }

    function resolveApplicantForUser(Applicants, Authentication, $q) {
        var userId = Authentication.user._id;
        var getApplicant = Applicants.ByUser.get({userId: userId});

        return getApplicant.$promise.catch(
            function (error) {
                if (error.status === 404) {
                    console.log('No Existing Applicant for User');
                    return null;
                }

                console.error('Hard error searching for applicant: %o', error);
                return $q.reject(error);
            }
        );
    }

    function resolveReportDetails(Reports, $stateParams) {
        var sku = $stateParams.sku;

        var getDetails = Reports.get(sku);

        return getDetails.$promise;
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
                templateUrl: 'modules/bgchecks/views/list-bgchecks.client.view.html'
            }).
            state('createBgcheck', {
                url: '/bgchecks/create',
                templateUrl: 'modules/bgchecks/views/create-bgcheck.client.view.html'
            }).
            state('viewBgcheck', {
                url: '/bgchecks/:bgcheckId',
                templateUrl: 'modules/bgchecks/views/view-bgcheck.client.view.html'
            }).
            state('editBgcheck', {
                url: '/bgchecks/:bgcheckId/edit',
                templateUrl: 'modules/bgchecks/views/edit-bgcheck.client.view.html'
            }).
            state('reviewReports', {
                url: '/reports/:sku',
                templateUrl: 'modules/bgchecks/views/review-reports.client.view.html',
                parent: 'headline-bg',
                controller: 'ReportListController',
                controllerAs: 'vm',
                bindToController: true,
                resolve: {
                    reports: resolveReports
                }
            }).
            state('orderReports', {
                url: '/reports/:sku/order',
                templateUrl: 'modules/bgchecks/views/enter-report-data.client.view.html',
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
                //template: '<section><embed ng-src="{{vm.content}}" style="width:200px;height:200px;"></embed><embed ng-src="{{vm.content2}}" style="width:200px;height:200px;"></embed></section>',
                templateUrl: 'modules/bgchecks/views/view-bgcheck.client.view.html',
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
            state('payments', {
                url: '/reports/:sku/pay',
                templateUrl: 'modules/bgchecks/views/paymentTest.client.view.html',
                parent: 'fixed-opaque',
                resolve: {
                    report: resolveReportDetails,
                    token: ['Payments', function(payments) {
                        var mytoken = payments.getToken();
                        return mytoken.$promise;

                    }],
                    applicant: resolveApplicantForUser
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

    ReportListController.$inject = ['reports', '$stateParams', 'AppConfig'];

    //Setting up route
    angular.module('bgchecks')
        .config(BgCheckRoutes)
        .controller('ReportListController', ReportListController);

})();
