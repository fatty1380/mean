(function () {
    'use strict';

    function CompanyDirectiveController(Authentication, $state) {
        var vm = this;

        vm.user = Authentication.user;

        if(vm.canEdit) {
            vm.createText = 'Before posting any jobs, you will need to create your company profile. Click the button below to continue.';
        }
        else {
            vm.createText = 'Sorry, but we have not finished our company profile page yet. Please check back again later.<br class="mgn-btm">Thanks, ' + vm.company.name;
        }

        vm.creEdit = function () {
            if(vm.company && vm.company._id) {
                $state.go('companies.edit', {'companyId': vm.company._id});
            }
            else {
                $state.go('companies.create');
            }
        };

    }

    function CompanyDirective() {
        var ddo;
        ddo = {
            templateUrl: '/modules/companies/views/templates/view-company.client.template.html',
            scope: {
                company: '=',
                inline: '=',
                config: '=?',
                canEdit: '=?'
            },
            restrict: 'E',
            replace: true,
            controller: 'CompanyDirectiveController',
            controllerAs: 'vm',
            bindToController: true
        };

        return ddo;
    }

    CompanyDirectiveController.$inject = ['Authentication', '$state'];

    angular.module('companies')
        .controller('CompanyDirectiveController', CompanyDirectiveController)
        .directive('osCompany', CompanyDirective);

})();
