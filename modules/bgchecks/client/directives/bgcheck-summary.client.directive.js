(function () {
    'use strict';

    function ReportsSummaryController(Reports, Applicants, $log, $state) {
        var vm = this;

        Reports.Types.list({returnAll: true}).$promise
            .then(function (fulfilled) {
                vm.reportTypes = fulfilled;
            }, function (error) {
                vm.error = error.message;
            });

        var uid = vm.userId || vm.user && vm.user._id;

        if (!!uid) {
            Applicants.ByUser.get({userId: uid}).$promise
                .then(function (applicant) {
                    $log.debug('got applicant repsonse! %o', applicant);
                    vm.applicant = applicant;
                    vm.reports = applicant && applicant.reports;

                    vm.calculateButtons();
                }, function (err) {
                    $log.debug('No Applicant found for user', err);
                });
        }

        vm.calculateButtons = function () {
            vm.viewReport;
            vm.reviewReport;
            vm.completeReport;

            if (vm.reports && vm.reports.length) {
                vm.complete = _.filter(vm.reports, {status: 'COMPLETED'});
                vm.pending = _.filter(vm.reports, {status: null});
                vm.inprocess = _.reject(_.reject(vm.reports, vm.pending), vm.complete);
            }

            vm.reportSellHeader = 'Choose from one of the following packages!';
            if (!vm.reports && !!vm.applicant) {
                vm.reportSellHeader = 'Continue your application process today!';
            }
            else if (!vm.complete) {
                vm.reportSellHeader = 'Report Status:';
            } else {
                vm.reportSellHeader = 'Add additional packages to your profile!';
            }
        };

        vm.viewReports = function() {
            $state.go('reviewReports');
        };
    }

    function BgCheckSummaryDirective() {

        var ddo = {
            templateUrl: '/modules/bgchecks/views/bgcheck-summary.client.template.html',
            restrict: 'E',
            scope: {
                user: '=?',
                userId: '@?'
            },
            controller: 'ReportsSummaryController',
            controllerAs: 'vm',
            bindToController: true
        };

        return ddo;
    }

    ReportsSummaryController.$inject = ['Reports', 'Applicants', '$log', '$state'];

    angular
        .module('bgchecks')
        .controller('ReportsSummaryController', ReportsSummaryController)
        .directive('osBgCheckSummary', BgCheckSummaryDirective);

})();
