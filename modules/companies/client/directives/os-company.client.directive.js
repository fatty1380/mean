(function () {
    'use strict';

    function CompanyDirectiveController(Authentication) {
        var vm = this;

        vm.user = Authentication.user;

        vm.createEnabled = vm.config.create;

        if(vm.createEnabled) {
            vm.createText = 'Before posting any jobs, you will need to create your company profile. Click the button below to continue.';
        }
        else {
            vm.createText = 'Thanks for signing up. Right now our site is only available to drivers to give them a chance to fill out their profiles and order reports. You will receive an email once the site is available for job postings.';
        }

    }

    function CompanyDirective() {
        var ddo;
        ddo = {
            templateUrl: 'modules/companies/views/templates/view-company.client.template.html',
            scope: {
                company: '=',
                inline: '=',
                config: '=?'
            },
            restrict: 'E',
            replace: true,
            controller: 'CompanyDirectiveController',
            controllerAs: 'vm',
            bindToController: true
        };

        return ddo;
    }

    CompanyDirectiveController.$inject = ['Authentication'];

    angular.module('companies')
        .controller('CompanyDirectiveController', CompanyDirectiveController)
        .directive('osCompany', CompanyDirective);

})();
