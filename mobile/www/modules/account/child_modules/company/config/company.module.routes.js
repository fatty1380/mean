(function () {
    'use strict';

    angular
        .module('company')
        .config(companyModuleConfig);

    companyModuleConfig.$inject = ['$stateProvider'];

    function companyModuleConfig($stateProvider) {

        $stateProvider
        // .state('company', {
        //     parent: 'account',
        //     url: '^/company/:companyId',
        //     views: {
        //         'company': {
        //             templateUrl: 'modules/account/child_modules/company/templates/company.profile.html',
        //             controller: 'CompanyCtrl as vm',
        //             resolve: {
        //                 company: ['$stateParams', '$http', '$ionicLoading', 'settings',
        //                     function ($stateParams, $http, $ionicLoading, settings) {
        //                         $ionicLoading.show({ template: 'Loading', duration: 10000 });
        //                         return $http.get(settings.companies + $stateParams.companyId)
        //                             .then(
        //                                 function success(result) {
        //                                     console.log('COmpany Result: ', result);
        //                                     return result.data;
        //                                 },
        //                                 function reject(err) {
        //                                     debugger;
        //                                     console.error('Company result failed', err);
        //                                     return {};
        //                                 });
        //                     }]
        //             }
        //         }
        //     }

        // })
            .state('company', {
                url: '^/company/:companyId',
                templateUrl: 'modules/account/child_modules/company/templates/company.profile.html',
                controller: 'CompanyCtrl as vm',
                resolve: {
                    company: ['$stateParams', '$http', '$ionicLoading', 'settings',
                        function ($stateParams, $http, $ionicLoading, settings) {
                            $ionicLoading.show({ template: 'Loading', duration: 10000 });
                            return $http.get(settings.companies + $stateParams.companyId)
                                .then(
                                    function success(result) {
                                        console.log('COmpany Result: ', result);
                                        return result.data;
                                    },
                                    function reject(err) {
                                        debugger;
                                        console.error('Company result failed', err);
                                        return {};
                                    });
                        }]
                }

            })

    }

})();
