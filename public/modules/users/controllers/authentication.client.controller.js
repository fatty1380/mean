'use strict';

function AuthenticationController($scope, $http, $location, $routeParams, Authentication) {
    $scope.authentication = Authentication;

    //If user is signed in then redirect back home
    if ($scope.authentication.user) {
        if (undefined !== $scope.authentication.user.roles.find(function(element) {
            if (element === 'user') {
                return true;
            }

            return false;
        })) {
            $location.path('profile');
        }
        $location.path('');
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

        $scope.credentials.type = $scope.signupType;
        console.log('[Auth.Ctrl.signup] signing up with credentials: ', $scope.credentials);

        $http.post('/auth/signup', $scope.credentials)
            .success(function(response) {
                //If successful we assign the response to the global user model
                $scope.authentication.user = response;

                console.log('Successfully created %o USER Profile', response.type);

                redirect(response.type, $location);

            }).error(function(response) {
                console.error(response.message);
                $scope.error = response.message;
            });
    };

    $scope.signin = function() {
        $http.post('/auth/signin', $scope.credentials)
            .success(function(response) {
                //If successful we assign the response to the global user model
                $scope.authentication.user = response;

                console.info('Loading a %o profile', response.type);

                redirect(response.type, $location);
            }).error(function(response) {
                $scope.error = response.message;
            });
    };

    var redirect = function(userType, $location) {
        if (userType === 'driver') {
            console.info('directing to a DRIVER profile');
            $location.path('/settings/profile');
        } else if (userType === 'owner') {
            console.info('redirecting to owner page');
            $location.path('/company');
        } else {
            console.warn('Unknown profile type: ' + userType);
            $location.path('/settings/profile');
        }
    };
}

AuthenticationController.$inject = ['$scope', '$http', '$location', '$routeParams', 'Authentication'];

angular
    .module('users')
    .controller('AuthenticationController', AuthenticationController);
