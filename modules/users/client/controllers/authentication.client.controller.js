(function() {
    'use strict';

    function AuthenticationController($scope, $http, $state, $location, $modalInstance, $log, Authentication) {
        $scope.authentication = Authentication;

        var redirect = function(userType) {
            $modalInstance.close(userType);

            switch (userType) {
                case 'driver':
                    $log.debug('[HomeController] Re-Routing to driver\'s profile page');
                    $state.go('drivers.home');
                    break;
                case 'owner':
                    $log.debug('[HomeController] Re-Routing to the user\'s companies');
                    $state.go('companies.home');
                    break;
                default:
                    if ($scope.authentication.isAdmin()) {
                        $state.go('users.list');
                        break;
                    }
            }
        };

        // If user is signed in then redirect back home
        if ($scope.authentication.user) {
            redirect($scope.authentication.user.type);
        } else {
            $state.go('intro');
        }

        $scope.init = function() {
            if ($location.$$path.indexOf('driver') !== -1) {
                $scope.signupType = 'driver';
            } else if ($location.$$path.indexOf('owner') !== -1) {
                $scope.signupType = 'owner';
            } else {
                $scope.typeNeeded = true;
            }

        };

        $scope.signup = function() {

            var credentials = $scope.credentials || this.credentials;

            credentials.type = $scope.signupType || this.signupType;
            $log.debug('[Auth.Ctrl.signup] signing up with credentials: ', $scope.credentials);

            $http.post('/api/auth/signup', credentials)
                .success(function(response) {
                    // If successful we assign the response to the global user model
                    $scope.authentication.user = response;

                    $log.debug('Successfully created %o USER Profile', response.type);

                    redirect(response.type);

                }).error(function(response) {
                    console.error(response.message);
                    $scope.error = response.message;
                });
        };

        $scope.signin = function() {

            var credentials = $scope.credentials || this.credentials;

            $http.post('/api/auth/signin', credentials)
                .success(function(response) {
                    // If successful we assign the response to the global user model
                    $scope.authentication.user = response;

                    redirect(response.type);
                }).error(function(response) {
                    $scope.error = response.message;
                });
        };

    }

    AuthenticationController.$inject = ['$scope', '$http', '$state', '$location', '$modalInstance', '$log', 'Authentication'];

    angular
        .module('users')
        .controller('AuthenticationController', AuthenticationController);
})();
