(function() {
    'use strict';

    // Drivers controller
    function DriversController($scope, $state, $stateParams, $location, $http, $window, $log, Authentication, Drivers) {
        $scope.authentication = Authentication;
        //$scope.driver = Drivers;
        //$scope.driverUser = DriverUser;
        $scope.createEnabled = false;

        // Local Variables
        $scope.licenses = [];
        $scope.experience = [];
        $scope.ratings = ['A', 'B', 'C', 'D', 'M', 'G'];
        $scope.rating = {
            model: undefined
        };

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


        // Create new Driver
        $scope.create = function() {

            if (!$scope.driverForm.$valid) {
                $scope.error = 'Please fill in required fields';
                return;
            }

            if (!$scope.license) {
                $scope.error = 'Please fill in information about your driver\'s license';
                return;
            }

            $scope.license.rating = $scope.rating.model;
            $scope.license.endorsements = $scope.endorsements;

            // TODO: determine if this is necessary on the client side or if it is better handled on the server
            angular.forEach($scope.experience, function(exp, i) {
                var start = new Date(exp.time.start.year, exp.time.start.month - 1);
                var end = new Date(exp.time.end.year, exp.time.end.month - 1);

                exp.time.start = start;
                exp.time.end = end;

                $log.debug('Start %o vs %o', start, exp.time.start, $scope.experience[i].time.start);
            });

            if ($scope.experience && $scope.experience.length > 0) {
                $log.debug('After iter: %o', $scope.experience[0].time.start);
            }

            // Create new Driver object
            var driver = new Drivers.ById({
                licenses: [
                    $scope.license
                ],
                experience: $scope.experience,
            });

            // Redirect after save
            driver.$save(function(response) {
                $log.debug('Successfully created new Driver');
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
                $location.path('driver/user/' + driver._id);
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Find a list of Drivers
        $scope.find = function() {
            $scope.drivers = Drivers.ById.query();
        };

        // Find existing Driver
        $scope.findOne = function(userId) {
            var id = userId || $stateParams.driverId;

            if (id && id !== 'me') {
                $scope.createEnabled = (id === $scope.authentication.user._id);

                $scope.driver = Drivers.ById.get({
                    driverId: id
                });
            } else {
                $scope.driver = Drivers.ByUser.get({
                    userId: $scope.authentication.user._id
                });
            }
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

        $scope.addExperience = function() {
            event.preventDefault();

            $scope.experience.push({
                text: '',
                time: {
                    start: {
                        month: null,
                        year: null
                    },
                    end: {
                        month: null,
                        year: null
                    }
                },
                location: ''
            });
        };

        $scope.date = new Date();

        $scope.moreExperienceDisplayHelper = function() {
            var experience = $scope.experience;

            if (experience && experience.length > 0) {
                var val = experience[experience.length - 1];

                if (val.text.length && val.location.length) {
                    if (val.time.start.month && val.time.start.year) {
                        return true;
                    }
                }
            }

            return false;
        };

        $scope.inspect = function() {
            debugger;
        };

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
