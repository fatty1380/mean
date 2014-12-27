(function () {
    'use strict';

    function ReportsSummaryController(Reports) {
        var vm = this;

        Reports.Types.list().$promise.then(function(fulfilled) {
            vm.reportTypes = fulfilled;
        }, function(error) {
            vm.error = error.message;
        });
    }

    function BgCheckSummaryDirective() {

        var ddo = {
            templateUrl: 'modules/bgchecks/views/bgcheck-summary.client.template.html',
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

    ReportsSummaryController.$inject=['Reports'];

    angular
        .module('bgchecks')
        .controller('ReportsSummaryController', ReportsSummaryController)
        .directive('osBgCheckSummary', BgCheckSummaryDirective);

})();
