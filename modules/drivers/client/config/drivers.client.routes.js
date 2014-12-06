'use strict';

//Setting up route
angular.module('drivers').config(['$stateProvider',
    function($stateProvider) {
        // Drivers state routing
        $stateProvider.

        state('drivers', {
            abstract: true,
            url: '/drivers',
            template: '<div ui-view></div>',
            parent: 'fixed-opaque'
        }).

        state('drivers.list', {
            url: '',
            templateUrl: 'modules/drivers/views/list-drivers.client.view.html',
            parent: 'drivers'
        }).

        state('drivers.create', {
            url: '/create',
            templateUrl: 'modules/drivers/views/edit-driver.client.view.html'
        }).

        state('drivers.me', {
            url: '/me',
            templateUrl: 'modules/drivers/views/view-driver.client.view.html',
            parent: 'drivers'
        }).

        state('drivers.view', {
            url: '/:driverId',
            templateUrl: 'modules/drivers/views/view-driver.client.view.html',
            parent: 'drivers'
        }).

        state('drivers.edit', {
            url: '/:driverId/edit',
            templateUrl: 'modules/drivers/views/edit-driver.client.view.html',
            parent: 'drivers'
        });
    }
]);
