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
                    company: ['$stateParams', '$state', 'LoadingService', 'CompanyService',
                        function ($stateParams, $state, LoadingService, CompanyService) {
                            LoadingService.showLoader('Loading');
                            return CompanyService.get($stateParams.companyId)
                                .then(
                                    function success(result) {
                                        logger.debug('Company Result: ', result);
                                        return result;
                                    })
                                .catch(
                                    function reject(err) {
                                        logger.error('Company result failed', err);
                                        return {};
                                    });
                        }],

                    jobs: ['$stateParams', '$state', 'company', 'CompanyService',
                        function ($stateParams, $state, company, CompanyService) {

                            return CompanyService.loadJobs($stateParams.companyId)
                                .then(
                                    function success(result) {
                                        logger.debug('Company Jobs Result: ', result);
                                        return result;
                                    })
                                .catch(function reject(err) {
                                    logger.error('Company Jobs result failed', err);
                                    return [];
                                });
                        }],
                    feed: ['$stateParams', '$state', 'company', 'CompanyService',
                        function ($stateParams, $state, company, CompanyService) {

                            return CompanyService.loadFeed($stateParams.companyId)
                                .then(
                                    function success(result) {
                                        logger.debug('Company Feed Result: ', result);
                                        return result;
                                    })
                                .catch(function reject(err) {
                                    logger.error('Company Feed result failed', err);
                                    return [];
                                });
                        }]
                }

            })

    }

})();
