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

        $scope.credentials.type = $scope.signupType;
        console.log('[Auth.Ctrl.signup] signing up with credentials: ', $scope.credentials);

        debugger;

        $http.post('/auth/signup', $scope.credentials)
            .success(function(response) {
                //If successful we assign the response to the global user model
                $scope.authentication.user = response;

                console.log('Successfully created ' + $scope.signupType + ' USER Profile');
                debugger;
                if ($scope.signupType === 'driver') {
                    console.info('Created a new DRIVER profile, checking user object');

                    console.log('User has Driver info: ' + $scope.authentication.user.driver);

                    $location.path('/settings/profile');

                } else if ($scope.signupType === 'owner') {
                    console.info('Creating a new OWNER profile');
                    $scope.error = 'Don\'t know how to create an owner ... redirecting';

                    $location.path('/company');
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
                debugger;

                if (response.types.indexOf('driver') !== -1) {
                    console.info('Loading a DRIVER profile');

                    debugger;

                    console.log('User has Driver info: ' + $scope.authentication.user.driver);

                    $scope.authentication.driver = response.driver;

                } else if (response.types.indexOf('owner') !== -1) {
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
