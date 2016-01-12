(function () {
    'use strict';

    angular
        .module('company')
        .controller('JobDetailsCtrl', JobDetailsCtrl);

    JobDetailsCtrl.$inject = ['parameters', 'CompanyService', '$state'];

    function JobDetailsCtrl(parameters, CompanyService, $state) {

        var vm = this;

        vm.entry = parameters.entry;
        
        vm.share = share;

        activate();
        
        /////////////////////////////////////////////////////////////
        
        function activate() {
            if (_.isEmpty(vm.entry)) {
                logger.error('No Job has been loaded into the Controller', parameters);
                debugger;
                return vm.close();
            }
            
            
        }
        
        function apply() {
            debugger;
        }

        function share() {
            
        }
    }
})();