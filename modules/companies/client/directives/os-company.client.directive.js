(function () {
    'use strict';

    function CompanyDirectiveController(Authentication) {
        var dm = this;

        dm.user = Authentication.user;

        dm.createText = 'Before posting any jobs, you will need to create your company profile. Click the button below to continue.';
    }

    function CompanyDirective() {
        var ddo;
        ddo = {
            templateUrl: 'modules/companies/views/templates/view-company.client.template.html',
            scope: {
                company: '=',
                inline: '='
            },
            restrict: 'E',
            replace: true,
            controller: 'CompanyDirectiveController',
            controllerAs: 'dm',
            bindToController: true
        };

        return ddo;
    }

    CompanyDirectiveController.$inject = ['Authentication'];

    angular.module('companies')
        .controller('CompanyDirectiveController', CompanyDirectiveController)
        .directive('osCompany', CompanyDirective);

})();
