(function() {
    'use strict';

    // Drivers controller
    function DriversController($scope, $state, $stateParams, $location, $http, $window, $log, Authentication, Drivers) {
        $scope.authentication = Authentication;
        //$scope.driver = Drivers;
        //$scope.driverUser = DriverUser;
        $scope.canEdit = $state.is('drivers.home') || ($stateParams.driverId === Authentication.user.id);

        // Local Variables
        $scope.experience = [];
        $scope.ratings = ['A', 'B', 'C', 'D', 'M', 'G'];
        $scope.rating = {
            model: undefined
        };

        // Date Picker Ctrl


        $scope.endorsements = [{
            key: 'HME (Hazardous Materials)',
            value: false
        }, {
            key: 'P (Passenger)',
            value: false
        }, {
            key: 'S (School Bus)',
            value: false
        }, {
            key: 'Double-Triple Trailer',
            value: false
        }, {
            key: 'Tank Vehicle',
            value: false
        }, {
            key: 'Motorcycle',
            value: false
        }];

        $scope.months = [{
            'key': '1',
            'value': 'January'
        }, {
            'key': '2',
            'value': 'February'
        }, {
            'key': '3',
            'value': 'March'
        }, {
            'key': '4',
            'value': 'April'
        }, {
            'key': '5',
            'value': 'May'
        }, {
            'key': '6',
            'value': 'June'
        }, {
            'key': '7',
            'value': 'July'
        }, {
            'key': '8',
            'value': 'August'
        }, {
            'key': '9',
            'value': 'September'
        }, {
            'key': '10',
            'value': 'October'
        }, {
            'key': '11',
            'value': 'November'
        }, {
            'key': '12',
            'value': 'December'
        }];

        $scope.init = function() {
            if ($state.is('drivers.view') || $state.is('drivers.home')) {
                $scope.action = 'Edit';
                return $scope.findOne();
            } else if ($state.is('drivers.create')) {
                $scope.submit = $scope.create;
                $scope.action = 'New';
            } else {
                $scope.action = 'Edit';
                $scope.submit = $scope.update;
                return $scope.findOne();
            }
        };




        // Remove existing Driver
        $scope.remove = function(driver) {
            if (driver) {
                driver.$remove();

                for (var i in $scope.drivers) {
                    if ($scope.drivers[i] === driver) {
                        $scope.drivers.splice(i, 1);
                    }
                }
            } else {
                $scope.driver.$remove(function() {
                    $location.path('drivers');
                });
            }
        };

        // Find existing Driver
        $scope.findOne = function(userId) {
            var id = userId || $stateParams.driverId;

            if (id && id === 'home') {
                $scope.canEdit = true;
            } else if (id) {
                $scope.canEdit = (id === $scope.authentication.user._id);
            }
        };

        var handleFindError = function(response) {
            $log.error('Error loading driver: [%s] %s', response.status, response.data.message);
            if (response.status === 404) {
                $log.info('No Driver found for this user');
            } else {
                $log.error('Error loading driver: [%s] %s', response.status, response.data.message);
            }

        };

        // Move to directive and/or filter
        $scope.endorsementFilter = function(item) {
            return item.value === true;
        };

        $scope.endorsementDisplay = function(item) {
            var i = item.key.indexOf('(');
            if (i > 0) {
                return item.key.substring(0, i).trim();
            }
            return item.key;
        };

        $scope.switchHelper = function(value) {

            if (!value || value.length === 0)
                return true;
            else
                return false;
        };

        $scope.cancel = function() {
            $log.debug('Canceling! Form is dirty: %o, valid: %o', $scope.driverForm.$dirty, $scope.driverForm.$valid);
            $window.history.back();
        };
    }

    DriversController.$inject = ['$scope', '$state', '$stateParams', '$location', '$http', '$window', '$log', 'Authentication', 'Drivers'];

    angular.module('drivers').controller('DriversController', DriversController);
})();
