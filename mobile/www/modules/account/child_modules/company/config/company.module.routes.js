(function () {
    'use strict';

    angular
        .module('company')
        .config(companyModuleConfig);

    companyModuleConfig.$inject = ['$stateProvider'];

    function companyModuleConfig($stateProvider) {

        $stateProvider

            .state('company', {
                url: '^/company/:companyId',
                templateUrl: 'modules/account/child_modules/company/templates/company.profile.html',
                controller: 'CompanyCtrl as vm',
                resolve: {
                    company: ['$stateParams', '$state', '$ionicLoading', 'CompanyService',
                        function ($stateParams, $state, $ionicLoading, CompanyService) {
                            $ionicLoading.show({ template: 'Loading', duration: 10000 });
                            return CompanyService.get($stateParams.companyId)
                                .then(
                                    function success(result) {
                                        console.log('Company Result: ', result);
                                        return result;
                                    })
                                .catch(
                                    function reject(err) {
                                        console.error('Company result failed', err);
                                        return {};
                                    });
                        }],

                    jobs: ['$stateParams', '$state', 'company', 'CompanyService',
                        function ($stateParams, $state, company, CompanyService) {

                            return CompanyService.loadJobs($stateParams.companyId)
                                .then(
                                    function success(result) {
                                        console.log('Company Jobs Result: ', result);
                                        return result;
                                    })
                                .catch(function reject(err) {
                                    console.error('Company Jobs result failed', err);
                                    return [];
                                });
                        }],
                    feed: ['$stateParams', '$state', 'company', 'CompanyService',
                        function ($stateParams, $state, company, CompanyService) {

                            return CompanyService.loadFeed($stateParams.companyId)
                                .then(
                                    function success(result) {
                                        console.log('Company Feed Result: ', result);
                                        return result;
                                    })
                                .catch(function reject(err) {
                                    console.error('Company Feed result failed', err);
                                    return [];
                                });
                        }]
                }

            })

    }

})();
