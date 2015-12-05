(function () {
    'use strict';
    
    angular.module('bgchecks')
        .controller('ReportListController', ReportListController);

    ReportListController.$inject = ['packages', '$state', '$stateParams', 'AppConfig'];
    function ReportListController(packages, $state, $stateParams, AppConfig) {
        var vm = this;

        vm.skus = $stateParams.sku;
        
        (function processPackages(packages) {
            var enabled = _.filter(packages, 'enabled');

            vm.packages = _.indexBy(enabled, 'position');
        })(packages);

        vm.faqs = AppConfig.getFaqs({ category: 'bgreport' }).then(function (vals) {

            console.log('[FAQ] promise resolved with %d vals', vals.length);

            vm.faqs = vals;
            return vals;
        });
        
        var titleConfig = _.findWhere(packages, { 'position': 'title' });

        vm.text = titleConfig && titleConfig.text || { 
            lead: 'Order Reports to Include with your Job Applications&hellip;',
            sub: '&hellip;and become 8-12x more likely to get the interview.'
        };

        vm.order = function (sku) {
            $state.go('orderReports', { sku: sku });
        };
    }
})();