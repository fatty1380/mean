(function () {
    'use strict';

    function CompanyDirectiveController(Authentication) {
        var dm = this;

        dm.user = Authentication.user;

        dm.createEnabled = dm.config.create;

        if(dm.createEnabled) {
            dm.createText = 'Before posting any jobs, you will need to create your company profile. Click the button below to continue.';
        }
        else {
            dm.createText = 'Thanks for signing up. Right now our site is only available to drivers to give them a chance to fill out their profiles and order reports. You will receive an email once the site is available for job postings.';
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
