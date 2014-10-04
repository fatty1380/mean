'use strict';

function SettingsController($scope, $http, $location, Users, Authentication, Address, Drivers, DriverUser) {
    $scope.activeModule = 'users';
    $scope.user = Authentication.user;
    $scope.user.driver = Authentication.driver;
    $scope.editMode = false;

    $scope.addresses = $scope.user.addresses;

    // If user is not signed in then redirect back home
    if (!$scope.user) $location.path('/');

    $scope.init = function() {
        console.log('[SettingsController] init(%o,%o)', $scope.user);
    };

    $scope.toggleMode = function(arg) {
        if (arg === undefined) {
            $scope.editMode = !$scope.editMode;
            return;
        }

        $scope.editMode = !!arg;
    };

    $scope.cancel = function() {
        if (this.view === 'user') {
            var driverTmp = angular.copy(Authentication.user.driver);
            $scope.user = angular.copy(Authentication.user);
            $scope.user.driver = driverTmp;
        } else if (this.view === 'driver') {
            $scope.user.driver = angular.copy(Authentication.user.driver);
        }

        this.editMode = false;
    };

    $scope.addAddress = function() {
        // Prevent this from bubbling up;
        event.preventDefault();

        var addr = new Address({
            type: 'select type',
            streetAddresses: [''],
        });
        $scope.addresses.push(addr);
    };

    // Check if there are additional accounts
    $scope.hasConnectedAdditionalSocialAccounts = function(provider) {
        for (var i in $scope.user.additionalProvidersData) {
            return true;
        }

        return false;
    };

    // Check if provider is already in use with current user
    $scope.isConnectedSocialAccount = function(provider) {
        return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
    };

    // Remove a user social account
    $scope.removeUserSocialAccount = function(provider) {
        $scope.success = $scope.error = null;

        $http.delete('/users/accounts', {
            params: {
                provider: provider
            }
        })
            .success(function(response) {
                // If successful show success message and clear form
                $scope.success = true;
                $scope.user = Authentication.user = response;
            })
            .error(function(response) {
                $scope.error = response.message;
            });
    };

    // Update a user profile
    $scope.updateUserProfile = function(isValid) {
        if (isValid) {
            $scope.success = $scope.error = null;
            var user = new Users($scope.user);

            user.$update(function(response) {
                $scope.success = true;
                Authentication.user = response;
                $scope.editMode = false;
            }, function(response) {
                $scope.error = response.data.message;
            });
        } else {
            $scope.submitted = true;
        }
    };

    // Change user password
    $scope.changeUserPassword = function() {
        $scope.success = $scope.error = null;

        $http.post('/users/password', $scope.passwordDetails)
            .success(function(response) {
                // If successful show success message and clear form
                $scope.success = true;
                $scope.passwordDetails = null;
            })
            .error(function(response) {
                $scope.error = response.message;
            });
    };

    $scope.signup = function() {
        debugger;
        $http.post('/auth/signup', $scope.credentials)
            .success(function(response) {
                //If successful we assign the response to the global user model
                $scope.authentication.user = response;

                //And redirect to the index page
                $location.path('/');
            })
            .error(function(response) {
                $scope.error = response.message;
            });
    };


}

SettingsController.$inject = ['$scope', '$http', '$location', 'Users', 'Authentication', 'Addresses', 'Drivers', 'DriverUser'];

angular
    .module('users')
    .controller('SettingsController', SettingsController);
