(function () {
    function BgCheckSummaryDirective() {

        var ddo = {
            templateUrl: 'modules/bgchecks/views/bgcheck-summary.client.template.html',
            restrict: 'E',
            scope: {
                user: '=?',
                userId: '@?'
            },
            controller: function() {},
            controllerAs: 'vm',
            bindToController: true
        };

        return ddo;
    }

    angular
        .module('bgchecks')
        .directive('osBgCheckSummary', BgCheckSummaryDirective);

})();
