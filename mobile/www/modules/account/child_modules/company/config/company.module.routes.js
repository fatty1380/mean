(function () {
    'use strict';

    angular
        .module('company')
        .config(companyModuleConfig);

    companyModuleConfig.$inject = ['$stateProvider'];

    function companyModuleConfig ($stateProvider) {

        $stateProvider
            .state('company', {
                url: '/company',
                templateUrl: 'modules/account/child_modules/company/templates/company.profile.html',
                controller: 'CompanyCtrl as vm'
            })

    }

})();
