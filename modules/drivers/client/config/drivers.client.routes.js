(function() {
    'use strict';

    function handle404s(err) {
        // recover here if err is 404
        if (err.status === 404) {
            console.warn('No Driver found ... resolving as null', err);
            return null;
        } //returning recovery

        console.error('Hard Error when retrieiving Driver', err);
        // otherwise return a $q.reject
        throw err;
    }

    function driverResolve(Drivers, params) {
        if (!!params.driverId) {
            console.log('Searching for driver ID: %s', params.driverId);
            return Drivers.get(params.driverId);
        }
        return Drivers.default;
    }

    function userResolve(Drivers, params, auth) {
        var val;
        if (!!params.userId) {
            val = params.userId;
            console.log('Searching for driver data for user %s', val);
        } else {
            val = auth.user._id;
            console.log('Searching for driver data for logged in user: %s', val);
        }

        var driver = Drivers.getByUser(val);

        return driver.catch(handle404s);
    }

    function driverListResolve(Drivers) {
        return Drivers.ById.query().$promise;
    }

    function config($stateProvider) {

        // Drivers state routing
        $stateProvider.

        state('drivers', {
            abstract: true,
            url: '/drivers',
            template: '<div ui-view class="content-section"></div>',
            parent: 'fixed-opaque'
        }).

        state('drivers.list', {
            url: '',
            templateUrl: '/modules/drivers/views/list-drivers.client.view.html',
            parent: 'drivers',
            resolve: {
                drivers: driverListResolve
            },
            controller: 'DriversListController',
            controllerAs: 'vm',
            bindToController: true
        }).

        state('drivers.create', {
            url: '/create',
            templateUrl: '/modules/drivers/views/edit-driver.client.view.html',
            parent: 'drivers',
            resolve: {
                driver: userResolve
            },
            controller: 'DriverEditController',
            controllerAs: 'vm',
            bindToController: true
        }).

        state('drivers.home', {
            url: '/home',
            templateUrl: '/modules/drivers/views/view-driver.client.view.html',
            parent: 'drivers',
            controller: 'DriverViewController',
            controllerAs: 'vm',
            bindToController: true,
            resolve: {
                driver: userResolve
            },
            authenticate: true
        }).

        //state('drivers.view', {
        //    url: '/{userId:[0-9a-fA-F]{24}}',
        //    templateUrl: '/modules/drivers/views/view-driver.client.view.html',
        //    parent: 'drivers',
        //    resolve: {
        //        driver: ['Drivers', '$stateParams', function(Drivers, $stateParams) {
        //                return Drivers.ByUser.get({
        //                    userId: $stateParams.userId
        //                }).$promise;
        //            }]
        //    },
        //    controller: 'DriverViewController',
        //    controllerAs: 'vm',
        //    bindToController: true
        //}).

        state('drivers.edit', {
            url: '/{driverId:[0-9a-fA-F]{24}}/edit',
            templateUrl: '/modules/drivers/views/edit-driver.client.view.html',
            parent: 'drivers',
            resolve: {
                driver: driverResolve
            },
            controller: 'DriverEditController',
            controllerAs: 'vm',
            bindToController: true
        }).

        state('drivers.documents', {
            url: '/{driverId:[0-9a-fA-F]{24}}/reports/:documentId',
            templateUrl: '/modules/drivers/views/document-viewer.client.view.html',
            parent: 'drivers',
            resolve: {
                driver: driverResolve
            },
            controller: 'DocumentViewController',
            controllerAs: 'vm',
            bindToController: true
        });
    }

    // Dependency Injection
    driverListResolve.$inject = ['Drivers'];
    driverResolve.$inject = ['Drivers', '$stateParams'];
    userResolve.$inject = ['Drivers', '$stateParams', 'Authentication'];
    config.$inject = ['$stateProvider'];

    //Setting up route
    angular.module('drivers').config(config);
})();
