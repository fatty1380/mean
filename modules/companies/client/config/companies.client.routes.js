(function() {
    'use strict';

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

    function userResolve(rsrc, params, auth) {
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
        }).$promise;
    }

    function config($stateProvider) {
        // Companies state routing
        $stateProvider.

        state('companies', {
            abstract: true,
            url: '/companies',
            template: '<div ui-view></div>',
            parent: 'fixed-opaque'
        }).

        state('companies.list', {
            url: '/list',
            templateUrl: 'modules/companies/views/list-companies.client.view.html',
            parent: 'companies',
            controller: 'CompaniesController',
            controllerAs: 'vm',
            resolve: {
                companies: function(rsrc) {
                    return rsrc.ById.query().$promise;
                }
            }
        }).

        state('companies.home', {
            url: '/home',
            templateUrl: 'modules/companies/views/view-company.client.view.html',
            parent: 'companies',
            controller: 'CompaniesController',
            controllerAs: 'vm',
            resolve: {
                company: userResolve
            }
        }).

        state('companies.create', {
            url: '/create',
            templateUrl: 'modules/companies/views/create-company.client.view.html',
            parent: 'companies',
            controller: 'CompaniesController',
            controllerAs: 'vm',
            resolve: {
                company: function() {
                    return {};
                }
            }
        }).

        state('companies.view', {
            url: '/:companyId',
            templateUrl: 'modules/companies/views/view-company.client.view.html',
            parent: 'companies',
            controller: 'CompaniesController',
            controllerAs: 'vm',
            resolve: {
                company: companyResolve
            }
        }).

        state('companies.edit', {
            url: '/{companyId}/edit',
            templateUrl: 'modules/companies/views/edit-company.client.view.html',
            parent: 'companies',
            controller: 'CompaniesController',
            controllerAs: 'vm',
            resolve: {
                company: companyResolve
            }
        });
    }

    // Dependency Injection
    companyResolve.$inject = ['Companies', '$stateParams'];
    userResolve.$inject = ['Companies', '$stateParams', 'Authentication'];
    config.$inject = ['$stateProvider'];

    //Setting up route
    angular.module('companies').config(config);
})();
