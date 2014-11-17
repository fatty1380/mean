'use strict';

//Setting up route
angular.module('companies').config(['$stateProvider',
    function($stateProvider) {
        // Companies state routing
        $stateProvider.

        state('companies', {
            abstract: true,
            url: '/companies',
            templateUrl: 'modules/core/views/fixed-width.client.view.html'
        }).

        state('companies.list', {
            url: '',
            templateUrl: 'modules/companies/views/list-companies.client.view.html',
            parent: 'companies'
        }).

        state('companies.create', {
            url: '/create',
            templateUrl: 'modules/companies/views/create-company.client.view.html',
            parent: 'companies'
        }).

        state('companies.view', {
            url: '/:companyId',
            templateUrl: 'modules/companies/views/view-company.client.view.html',
            parent: 'companies'
        }).

        state('companies.edit', {
            url: '/:companyId/edit',
            templateUrl: 'modules/companies/views/edit-company.client.view.html',
            parent: 'companies'
        }).

        state('companies.me', {
            url: '/me',
            templateUrl: 'modules/companies/views/view-company.client.view.html',
            parent: 'companies'
        });
    }
]);
