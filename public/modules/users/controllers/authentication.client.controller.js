'use strict';

function AuthenticationController($scope, $http, $location, Authentication) {
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

    $scope.signup = function() {
        debugger;

        $scope.credentials.types = [$scope.signupType];

        console.log('signing up with credentials: ', $scope.credentials);

        $http.post('/auth/signup', $scope.credentials)
            .success(function(response) {
                //If successful we assign the response to the global user model
                $scope.authentication.user = response;

                debugger;
                if ($scope.signupType === 'driver') {
                    console.info('Creating a new DRIVER profile');

                    $http.post('/driver/create', $scope.authentication.user)
                        .success(function(response) {
                            debugger;

                            console.log('got response: ', response);

                            $scope.authentication.driver = response;

                            $location.path('/settings/profile');
                        })
                        .error(function(response) {
                            console.error(response.message);
                            $scope.error = response.message;

                            $location.path('/settings/profile');
                        });

                } else if ($scope.signupType === 'owner') {
                    console.info('Creating a new OWNER profile');
                    $scope.error = 'Don\'t know how to create an owner ... redirecting';

                    $location.path('/settings/profile');
                } else {
                    console.warn('Unknown profile type: ' + $scope.signupType);

                    //And redirect to the index page
                    $scope.error = 'Don\'t know how to create a "' + $scope.signupType + '" ... redirecting';

                    $location.path('/settings/profile');
                }

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

                if ($scope.signupType === 'driver') {
                    console.info('Creating a new DRIVER profile');

                    $http.post('/driver/', $scope.authentication.user)
                        .success(function(response) {
                            debugger;

                            console.log('got response: ', response);

                            $scope.authentication.driver = response;

                            $location.path('/settings/profile');
                        })
                        .error(function(response) {
                            debugger;
                            console.error(response.message);
                            $scope.error = response.message;

                            $location.path('/settings/profile');
                        });

                } else if ($scope.signupType === 'owner') {
                    console.info('Creating a new OWNER profile');
                    $scope.error = 'Don\'t know how to load an owner ... redirecting';

                    $location.path('/settings/profile');
                } else {
                    console.warn('Unknown profile type: ' + $scope.signupType);

                    //And redirect to the index page
                    $scope.error = 'Don\'t know how to load a "' + $scope.signupType + '" ... redirecting';

                    $location.path('/settings/profile');
                }

                //And redirect to the index page
                $location.path('/settings/profile');
            }).error(function(response) {
                $scope.error = response.message;
            });
    };
}

AuthenticationController.$inject = ['$scope', '$http', '$location', 'Authentication'];

angular
    .module('users')
    .controller('AuthenticationController', AuthenticationController);
