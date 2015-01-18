(function () {
    'use strict';

    function moduleConfigResolve(AppConfig, auth) {
        return AppConfig.getModuleConfig(auth.user.type, 'company');
    }

    function companyResolve(rsrc, params, auth) {

        var val;

        if (!!params.companyId) {
            val = params.companyId;
            console.log('Searching for company ID: %s', val);

            return rsrc.ById.get({
                companyId: val
            }).$promise;
        }

        if (!!params.userId) {
            console.log('Searching for company data for user %s', params.userId);
            val = params.userId;
        } else {
            console.log('Searching for company data for logged in user');
            val = auth.user._id;
        }
        return rsrc.ByUser.get({
            userId: val
        }).$promise.catch(function (error) {
                if (error.status === 404) {
                    console.log('Unable to find company');
                    return {
                        ownerId: auth.user._id
                    };
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
                    company: companyResolve,
                    config: moduleConfigResolve
                }
            }).

            state('companies.view', {
                url: '/{companyId:[0-9a-fA-F]{24}}',
                templateUrl: 'modules/companies/views/view-company.client.view.html',
                parent: 'companies',
                controller: 'CompaniesController',
                controllerAs: 'vm',
                resolve: {
                    company: companyResolve,
                    config: moduleConfigResolve
                }
            }).

            state('companies.create', {
                url: '/create/{companyId:[0-9a-fA-F]{24}}',
                templateUrl: 'modules/companies/views/edit-company.client.view.html',
                parent: 'companies',
                controller: 'CompanyEditController',
                controllerAs: 'vm',
                params: {
                    companyId: {
                        default: null,
                        isArray: true,
                        squish: true
                    }
                },
                resolve: {
                    company: companyResolve,
                    config: moduleConfigResolve
                }
            }).

            state('companies.edit', {
                url: '/{companyId:[0-9a-fA-F]{24}}/edit',
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
    companyResolve.$inject = ['Companies', '$stateParams', 'Authentication'];
    moduleConfigResolve.$inject = ['AppConfig', 'Authentication'];
    config.$inject = ['$stateProvider'];

//Setting up route
    angular.module('companies').config(config);
})
();
