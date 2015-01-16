(function () {
    'use strict';

    function newCompany(auth) {
        return {
            ownerId: auth.user._id
        };
    }

    function companyResolve(rsrc, params) {
        if (!!params.companyId) {
            var val = params.companyId;
            console.log('Searching for company ID: %s', val);

            return rsrc.ById.get({
                companyId: val
            }).$promise;
        }
        return {};
    }

    function moduleConfigResolve(AppConfig, auth) {
        return AppConfig.getModuleConfig(auth.user.type, 'company');
    }

    function userResolve(rsrc, params, auth) {

        if (!!params.companyId) {
            console.log('userResolve has a companyId: rerouting');
            return companyResolve(rsrc, params);
        }

        var val;
        if (!!params.userId) {
            console.log('Searching for company data for user %s', params.userId);
            val = params.userId;
        } else {
            console.log('Searching for company data for logged in user');
            val = auth.user._id;
        }
        return rsrc.ByUser.get({
            userId: val
        }).$promise.then(function (value) {
                console.log('Successfully got company %o', value);
                return value;
            },
            function (error) {
                if (error.status === 404) {
                    console.log('Unable to find company');
                    return null;
                }
                else {
                    throw error;
                }
            });
    }

    function config($stateProvider) {
        // Companies state routing
        $stateProvider.

            state('companies', {
                abstract: true,
                url: '/companies',
                template: '<div ui-view class="content-section"></div>',
                parent: 'fixed-opaque'
            }).

            state('companies.list', {
                url: '/list',
                templateUrl: 'modules/companies/views/list-companies.client.view.html',
                parent: 'companies',
                controller: 'CompaniesController',
                controllerAs: 'vm',
                resolve: {
                    companies: function (rsrc) {
                        return rsrc.ById.query().$promise;
                    },
                    config: moduleConfigResolve
                }
            }).

            state('companies.home', {
                url: '/home',
                templateUrl: 'modules/companies/views/view-company.client.view.html',
                parent: 'companies',
                controller: 'CompaniesController',
                controllerAs: 'vm',
                resolve: {
                    company: userResolve,
                    config: moduleConfigResolve
                }
            }).

            state('companies.create', {
                url: '/create',
                templateUrl: 'modules/companies/views/edit-company.client.view.html',
                parent: 'companies',
                controller: 'CompanyEditController',
                controllerAs: 'vm',
                resolve: {
                    company: newCompany,
                    config: moduleConfigResolve
                }
            }).

            state('companies.view', {
                url: '/:companyId',
                templateUrl: 'modules/companies/views/view-company.client.view.html',
                parent: 'companies',
                controller: 'CompaniesController',
                controllerAs: 'vm',
                resolve: {
                    company: companyResolve,
                    config: moduleConfigResolve
                }
            }).

            state('companies.edit', {
                url: '/{companyId}/edit',
                templateUrl: 'modules/companies/views/edit-company.client.view.html',
                parent: 'companies',
                controller: 'CompanyEditController',
                controllerAs: 'vm',
                resolve: {
                    company: companyResolve,
                    config: moduleConfigResolve
                }
            });
    }

    // Dependency Injection
    companyResolve.$inject = ['Companies', '$stateParams'];
    userResolve.$inject = ['Companies', '$stateParams', 'Authentication'];
    moduleConfigResolve.$inject = ['AppConfig', 'Authentication'];
    newCompany.$inject = ['Authentication'];
    config.$inject = ['$stateProvider'];

    //Setting up route
    angular.module('companies').config(config);
})();
