(function() {
    'use strict';


    function driver_resolve(rsrc, params) {
        if (!!params.driverId) {
            var val = params.driverId;
            console.log('Searching for driver ID: %s', val);

            return rsrc.ById.get({
                driverId: val
            }).$promise;
        }
        return {};
    }

    function user_resolve(rsrc, params, auth) {
        var val;
        if (!!params.userId) {
            console.log('Searching for driver data for user %s', params.userId);
            val = params.userId;
        } else {
            console.log('Searching for driver data for logged in user');
            val = auth.user._id;
        }
        debugger;

        return rsrc.ByUser.get({
            userId: val
        }).$promise.then(function(value) {
            console.log('Successfully got driver %o', value);
            return value;
        },
        function(error) {
            if(error.status === 404) {
                console.log('Unable to find driver');
                return null;
            }
            else throw error;
        });
    }

    function driver_list_resolve(rsrc) {
        return rsrc.ById.query().$promise;
    }

    function config($stateProvider) {
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
            parent: 'drivers',
            resolve: {
                drivers: driver_list_resolve
            },
            controller: 'DriversListController',
            controllerAs: 'vm',
            bindToController: true
        }).

        state('drivers.create', {
            url: '/create',
            templateUrl: 'modules/drivers/views/edit-driver.client.view.html',
            parent: 'drivers',
            resolve: {
                driver: user_resolve
            },
            controller: 'DriverEditController',
            controllerAs: 'vm',
            bindToController: true
        }).

        state('drivers.home', {
            url: '/home',
            templateUrl: 'modules/drivers/views/view-driver.client.view.html',
            parent: 'drivers',
            controller: 'DriverViewController',
            controllerAs: 'vm',
            bindToController: true,
            resolve: {
                driver: user_resolve
            },
            authenticate: true
        }).

        state('drivers.view', {
            url: '/:driverId',
            templateUrl: 'modules/drivers/views/view-driver.client.view.html',
            parent: 'drivers',
            resolve: {
                driver: driver_resolve
            },
            controller: 'DriverViewController',
            controllerAs: 'vm',
            bindToController: true
        }).

        state('drivers.edit', {
            url: '/:driverId/edit',
            templateUrl: 'modules/drivers/views/edit-driver.client.view.html',
            parent: 'drivers',
            resolve: {
                driver: driver_resolve
            },
            controller: 'DriverEditController',
            controllerAs: 'vm',
            bindToController: true
        });
    }

    // Dependency Injection
    driver_list_resolve.$inject = ['Drivers'];
    driver_resolve.$inject = ['Drivers', '$stateParams'];
    user_resolve.$inject = ['Drivers', '$stateParams', 'Authentication'];
    config.$inject = ['$stateProvider'];

    //Setting up route
    angular.module('drivers').config(config);
})();
