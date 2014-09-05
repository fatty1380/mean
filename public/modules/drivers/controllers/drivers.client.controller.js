'use strict';

// Drivers controller
function DriversController($scope, $stateParams, $location, $http, Authentication, Drivers, DriverUser) {
    $scope.authentication = Authentication;
    $scope.driver = Drivers;
    $scope.driverUser = DriverUser;

    // Create new Driver
    $scope.create = function() {
        // Create new Driver object
        var driver = new Drivers({
            name: this.name
        });

        // Redirect after save
        driver.$save(function(response) {
            $location.path('drivers/' + response._id);
        }, function(errorResponse) {
            $scope.error = errorResponse.data.message;
        });

        // Clear form fields
        this.name = '';
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

    // Update existing Driver
    $scope.update = function() {
        var driver = $scope.driver;

        driver.$update(function() {
            $location.path('drivers/' + driver._id);
        }, function(errorResponse) {
            $scope.error = errorResponse.data.message;
        });
    };

    // Find a list of Drivers
    $scope.find = function() {
        $scope.drivers = Drivers.query();
    };

    // Find existing Driver
    $scope.findOne = function() {
        $scope.driver = Drivers.get({
            driverId: $stateParams.driverId
        });
    };

    $scope.findByUser = function(ct) {
        ct = ct || 1;

        if (ct > 30) {
            return;
        }

        if (!$scope.user || $scope.user._id === undefined) {
            console.log('No user yet ... waiting 500');
            setTimeout(function() {
                $scope.findByUser(ct++);
            }, 500);
            return;
        }

        debugger;
        $scope.driver = DriverUser.get({
            userId: $scope.user._id
        });
    };

    // Specific Driver Functions
    $scope.addLicense = function() {

        $scope.success = $scope.error = null;
        event.preventDefault();

        $http.get('/drivers/newLicense', $scope.licenses)
            .success(function(response) {
                $scope.user.licenses.push(response);
            })
            .error(function(response) {
                alert('Failed with response: ' + response.message);

                var data = {
                    type: 'pscope',
                    number: 'pscope',
                    state: 'pscope',
                    issued: new Date('2014-07-01'),
                    expired: new Date('2014-07-01'),
                    endorsements: []
                };

                $scope.user.licenses.push({
                    info: data
                });
            });
    };

    $scope.switchHelper = function(value) {

        if (!value || value.length === 0)
            return true;
        else
            return false;
    };
}

DriversController.$inject = ['$scope', '$stateParams', '$location', '$http', 'Authentication', 'Drivers', 'DriverUser'];

angular.module('drivers').controller('DriversController', DriversController);
