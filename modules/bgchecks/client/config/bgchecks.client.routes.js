(function () {
    'use strict';

    function ReportListController(reports, $stateParams) {
        var vm = this;

        vm.skus = $stateParams.sku;

        vm.reports = reports;

    }

    function ReportDetailsController(report, applicant) {
        var vm = this;

        vm.report = report;
        vm.model = {};

        vm.introText = 'To get started, you will need to provide us with some information. We\'ll do our best to fill in what we already know, and won\'t make you fill it out again.';
        vm.getStartedText = 'Each report type requires different information. Please fill in the following fields in order to continue';

        vm.report.fields.map(translateFieldsToNg);

        vm.applicant = applicant || {};
        if (!vm.applicant.hasOwnProperty('remoteData')) {
            vm.report.fields.map(createApplicantModel);
        } else {
            vm.model = applicant.remoteData;
        }

        function createApplicantModel(field) {
            switch (field.type) {
                case 'array':
                    vm.applicant[field.name] = [];
                    break;
                case 'object':
                    vm.applicant[field.name] = {};
                    break;
                default:
                    vm.applicant[field.name] = '';
            }
        }

        function translateFieldsToNg(field) { // jshint ignore:line
            switch (field.type) {
                case 'string':
                    if (!!field.pickList) {
                        field.isPickList = true;
                        break;
                    }
                    field.ngType = 'text';
                    field.ngMaxLength = field.length;
                    break;
                case 'datelong':
                    // TODO: Fix this code once format is known
                    var d = vm.model[field.name];
                    if (d) {
                        if (d.toString().length === 8) {
                            vm.model[field.name] = moment(d, 'YYYYMMDD').toDate();
                        } else {
                            // Assume that we are in (EST:UTC-5)
                            vm.model[field.name] = moment.utc(d).subtract(5, 'hours').toDate();
                        }
                    }
                    field.ngType = 'date';
                    break;
                case 'state':
                    break;
                case 'country':
                    break;
                case 'object':
                    if (field.dataFields) {
                        field.dataFields.map(translateFieldsToNg);
                    }
                    field.isObject = true;
                    break;
                case 'array':
                    if (field.dataFields) {
                        field.dataFields.map(translateFieldsToNg);
                    }
                    field.isArray = true;
                    field.values = field.values || [];
                    break;
            }

            var sensitive = /^governmentId|SSN$/i;

            if (sensitive.test(field.name) || sensitive.test(field.description)) {
                field.ngSensitive = true;
                field.ngType = 'ssn';
            }

            return field;
        }

        vm.submit = function submit(form, event) {
            debugger;
        };

    }

    function resolveApplicantForUser(Applicants, Authentication, $q) {
        var userId = Authentication.user._id;
        var getApplicant = Applicants.ByUser.get({userId: userId});

        return getApplicant.$promise.catch(
            function(error) {
                if(error.status === 404) {
                    console.log('No Existing Applicant for User');
                    return null;
                }

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
                parent: 'headline-bg',
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
                url: '/paymentTest',
                templateUrl: 'modules/bgchecks/views/paymentTest.client.view.html',
                parent: 'fixed-opaque',
                controller: function() {
                    braintree.setup('eyJ2ZXJzaW9uIjoxLCJhdXRob3JpemF0aW9uRmluZ2VycHJpbnQiOiIzNTBhZDhkMjk4ZTU4NDc3OGFiODMyYTgzNDFkYThiMDI3NDUxYzJiOTY3ZWRjZDc4NTAwZmQ4MGMzNTllNGZlfGNyZWF0ZWRfYXQ9MjAxNS0wMS0wNFQwMDozNzo0Ni44MzA3ODU0NDIrMDAwMFx1MDAyNm1lcmNoYW50X2lkPWRjcHNweTJicndkanIzcW5cdTAwMjZwdWJsaWNfa2V5PTl3d3J6cWszdnIzdDRuYzgiLCJjb25maWdVcmwiOiJodHRwczovL2FwaS5zYW5kYm94LmJyYWludHJlZWdhdGV3YXkuY29tOjQ0My9tZXJjaGFudHMvZGNwc3B5MmJyd2RqcjNxbi9jbGllbnRfYXBpL3YxL2NvbmZpZ3VyYXRpb24iLCJjaGFsbGVuZ2VzIjpbXSwicGF5bWVudEFwcHMiOltdLCJjbGllbnRBcGlVcmwiOiJodHRwczovL2FwaS5zYW5kYm94LmJyYWludHJlZWdhdGV3YXkuY29tOjQ0My9tZXJjaGFudHMvZGNwc3B5MmJyd2RqcjNxbi9jbGllbnRfYXBpIiwiYXNzZXRzVXJsIjoiaHR0cHM6Ly9hc3NldHMuYnJhaW50cmVlZ2F0ZXdheS5jb20iLCJhdXRoVXJsIjoiaHR0cHM6Ly9hdXRoLnZlbm1vLnNhbmRib3guYnJhaW50cmVlZ2F0ZXdheS5jb20iLCJhbmFseXRpY3MiOnsidXJsIjoiaHR0cHM6Ly9jbGllbnQtYW5hbHl0aWNzLnNhbmRib3guYnJhaW50cmVlZ2F0ZXdheS5jb20ifSwidGhyZWVEU2VjdXJlRW5hYmxlZCI6dHJ1ZSwidGhyZWVEU2VjdXJlIjp7Imxvb2t1cFVybCI6Imh0dHBzOi8vYXBpLnNhbmRib3guYnJhaW50cmVlZ2F0ZXdheS5jb206NDQzL21lcmNoYW50cy9kY3BzcHkyYnJ3ZGpyM3FuL3RocmVlX2Rfc2VjdXJlL2xvb2t1cCJ9LCJwYXlwYWxFbmFibGVkIjp0cnVlLCJwYXlwYWwiOnsiZGlzcGxheU5hbWUiOiJBY21lIFdpZGdldHMsIEx0ZC4gKFNhbmRib3gpIiwiY2xpZW50SWQiOm51bGwsInByaXZhY3lVcmwiOiJodHRwOi8vZXhhbXBsZS5jb20vcHAiLCJ1c2VyQWdyZWVtZW50VXJsIjoiaHR0cDovL2V4YW1wbGUuY29tL3RvcyIsImJhc2VVcmwiOiJodHRwczovL2Fzc2V0cy5icmFpbnRyZWVnYXRld2F5LmNvbSIsImFzc2V0c1VybCI6Imh0dHBzOi8vY2hlY2tvdXQucGF5cGFsLmNvbSIsImRpcmVjdEJhc2VVcmwiOm51bGwsImFsbG93SHR0cCI6dHJ1ZSwiZW52aXJvbm1lbnROb05ldHdvcmsiOnRydWUsImVudmlyb25tZW50Ijoib2ZmbGluZSIsIm1lcmNoYW50QWNjb3VudElkIjoic3RjaDJuZmRmd3N6eXR3NSIsImN1cnJlbmN5SXNvQ29kZSI6IlVTRCJ9LCJjb2luYmFzZUVuYWJsZWQiOmZhbHNlfQ==', 'dropin', {
                        container: 'dropin'
                    });
                }
            });
    }

    BgCheckRoutes.$inject = ['$stateProvider'];

    resolveApplicantForUser.$inject = ['Applicants', 'Authentication', '$q'];
    resolveReports.$inject = ['Reports', '$stateParams'];
    resolveReportDetails.$inject = ['Reports', '$stateParams'];

    ReportListController.$inject = ['reports', '$stateParams'];
    ReportDetailsController.$inject = ['report', 'applicant'];

    //Setting up route
    angular.module('bgchecks')
        .config(BgCheckRoutes)
        .controller('ReportListController', ReportListController)
        .controller('ReportDetailsController', ReportDetailsController);

})();
