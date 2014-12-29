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

        function translateFieldsToNg(field) {
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
