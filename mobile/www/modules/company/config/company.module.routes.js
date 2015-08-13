(function () {
    'use strict';

    var companyModuleConfig = function ($stateProvider) {
        $stateProvider

            .state('company', {
                url: '/company',
                templateUrl: 'modules/company/templates/company.profile.html',
                controller: 'CompanyCtrl as vm'
            })
    };

    companyModuleConfig.$inject = ['$stateProvider'];

    angular
        .module('company')
        .config(companyModuleConfig);

})();
