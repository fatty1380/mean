(function() {
    'use strict';

    function CompanyCtrl() {
        var vm = this;

        vm.companyData = {
            name: 'Company Name'
        }

    }

    CompanyCtrl.$inject = [];

    angular
        .module('company')
        .controller('CompanyCtrl', CompanyCtrl);

})();
