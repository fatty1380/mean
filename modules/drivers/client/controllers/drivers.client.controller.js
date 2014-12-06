(function() {
    'use strict';

    // Drivers controller
    function DriversController($scope, $state, $stateParams, $location, $http, $window, $log, Authentication, Drivers) {
        $scope.authentication = Authentication;
        //$scope.driver = Drivers;
        //$scope.driverUser = DriverUser;
        $scope.canEdit = $state.is('drivers.me') || ($stateParams.driverId === Authentication.user.id);

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
            if ($state.is('drivers.view') || $state.is('drivers.me')) {
                $scope.action = 'Edit';
                return $scope.findOne();
            } else if ($state.is('drivers.create')) {
                $scope.driver = {
                    experience: [],
                    licenses: [{}]
                };
                $scope.submit = $scope.create;
                $scope.action = 'New';
            } else {
                $scope.action = 'Edit';
                $scope.submit = $scope.update;
                return $scope.findOne();
            }
        };


        // Create new Driver
        $scope.create = function() {

            if (!$scope.driverForm.$valid) {
                $scope.error = 'Please fill in required fields';
                return;
            }

            if (!$scope.driver.licenses || !$scope.driver.licenses[0]) {
                $scope.error = 'Please fill in information about your driver\'s license';
                return;
            }

            // TODO: determine if this is necessary on the client side or if it is better handled on the server
            angular.forEach($scope.driver.experience, function(exp, i) {
                var start = new Date(exp.time.start.year, exp.time.start.month - 1);
                var end = new Date(exp.time.end.year, exp.time.end.month - 1);

                exp.time.start = start;
                exp.time.end = end;

                $log.debug('Start %o vs %o', start, exp.time.start, $scope.experience[i].time.start);
            });

            if ($scope.driver.experience && $scope.driver.experience.length > 0) {
                $log.debug('After iter: %o', $scope.experience[0].time.start);
            }

            // Create new Driver object
            var driver = new Drivers.ById($scope.driver);

            // Redirect after save
            driver.$save(function(response) {
                $log.debug('Successfully created new Driver');
                $state.go('drivers.view', {
                    driverId: response._id
                });
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
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

            driver.$update(function(response) {
                debugger;
                $state.go('drivers.view', {
                    driverId: response._id
                });
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

            if (id && id === 'me') {
                $scope.canEdit = true;

                $scope.driver = Drivers.ByUser.get({
                    userId: $scope.authentication.user._id
                }, function() {
                    $log.info('Successfully loaded LoggedInUser Driver Profile');
                }, handleFindError);
            } else if (id) {
                $scope.canEdit = (id === $scope.authentication.user._id);

                $scope.driver = Drivers.ById.get({
                    driverId: id
                }, function(id) {
                    $log.info('Successfully loaded Driver Profile for id: %s', id);
                }, handleFindError);
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

        $scope.dropExperience = function(exp) {
            exp = exp || this.exp;

            if (exp) {

                for (var i in $scope.driver.experience) {
                    if ($scope.driver.experience[i] === exp) {
                        $scope.driver.experience.splice(i, 1);
                    }
                }
            }
        };

        $scope.addExperience = function() {
            event.preventDefault();

            $scope.driver.experience.push({
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
                location: '',
                isFresh: true
            });
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
