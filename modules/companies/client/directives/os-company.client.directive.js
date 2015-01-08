(function () {
    'use strict';

    function CompanyDirectiveController(Authentication) {
        var dm = this;

        dm.user = Authentication.user;

        dm.createEnabled = false;
        dm.createText = 'Thanks for signing up. We are in a limited release at this time as we build up our marketplace. We will be launching soon to employers like you with the best source for transportation hiring. Don\'t worry, we will give you time to setup your profile before we open the gates. Look for our launch email soon.';
        //dm.createText = 'Before posting any jobs, you will need to create your company profile. Click the button below to continue.';
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
