(function() {
'use strict';

    function SettingsController($scope, $http, $location, $log, Users, Authentication, Address) {
        $scope.activeModule = 'users';
		$scope.user = Authentication.user;

		// If user is not signed in then redirect back home
        if (!$scope.user) {
            $location.path('/');
        } else {
            debugger;
        }

        $scope.init = function() {
            $log.debug('[SettingsController] init(%o)', $scope.user);
            $scope.user = Authentication.user;
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

			$http.delete('/api/users/accounts', {
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
			if (isValid){
				$scope.success = $scope.error = null;
				var user = new Users($scope.user);
	
				user.$update(function(response) {
                    $scope.user = Authentication.user = response;
                    $scope.cancel();
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

			$http.post('/api/users/password', $scope.passwordDetails)
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
            $http.post('/auth/signup', $scope.credentials)
                .success(function(response) {
                    //If successful we assign the response to the global user model
                    $scope.authentication.user = response;

                    //And redirect to the index page
                    $location.path('/settings/profile');
                })
                .error(function(response) {
                    $scope.error = response.message;
                });
        };


	}

    SettingsController.$inject = ['$scope', '$http', '$location', '$log', 'Users', 'Authentication', 'Addresses'];

    angular
        .module('users')
        .controller('SettingsController', SettingsController);
})();
