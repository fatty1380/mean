'use strict';

// Addresses controller
angular.module('addresses').controller('AddressesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Addresses',
    function($scope, $stateParams, $location, Authentication, Addresses) {
        $scope.authentication = Authentication;

        $scope.types = ['main', 'home', 'business', 'billing', 'other'];

        // Create new Address
        $scope.create = function() {
            // Create new Address object
            var address = new Addresses({});

            // Redirect after save
            address.$save(function(response) {
                console.log('Created new Address Object');
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
                console.error('Address Creation Failed: ', $scope.error);
            });
        };

        // Remove existing Address
        $scope.remove = function(address) {
            if (address) {
                address.$remove();

                for (var i in $scope.addresses) {
                    if ($scope.addresses[i] === address) {
                        $scope.addresses.splice(i, 1);
                    }
                }
            } else {
                $scope.address.$remove(function() {
                    $location.path('addresses');
                });
            }
        };

        // Update existing Address
        $scope.update = function() {
            var address = $scope.address;

            address.$update(function() {
                console.log('Updated Address object');
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Find a list of Addresses
        $scope.find = function() {
            $scope.addresses = Addresses.query();
        };

        // Find existing Address
        $scope.findOne = function() {
            $scope.address = Addresses.get({
                addressId: $stateParams.addressId
            });
        };
    }
]);
