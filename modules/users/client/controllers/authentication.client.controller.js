(function() {
'use strict';

    function AuthenticationController($scope, $http, $state, $location, $routeParams, $modalInstance, $log, Authentication) {
		$scope.authentication = Authentication;

        var redirect = function(userType) {
            $modalInstance.close(userType);

            switch (userType) {
                case 'driver':
                    $log.debug('[HomeController] Re-Routing to driver\'s profile page');
                    $state.go('profile.me');
                    break;
                case 'owner':
                    $log.debug('[HomeController] Re-Routing to the user\'s companies');
                    $state.go('companies.me');
                    break;
                default:
                    if ($scope.authentication.user.roles.indexOf('admin') !== -1) {
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

            $scope.credentials.type = $scope.signupType;
            $log.debug('[Auth.Ctrl.signup] signing up with credentials: ', $scope.credentials);

            $http.post('/api/auth/signup', $scope.credentials)
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
            $http.post('/api/auth/signin', $scope.credentials)
                .success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

                    redirect(response.type);
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

	}

    AuthenticationController.$inject = ['$scope', '$http', '$state', '$location', '$routeParams', '$modalInstance', '$log', 'Authentication'];

    angular
        .module('users')
        .controller('AuthenticationController', AuthenticationController);
})();
