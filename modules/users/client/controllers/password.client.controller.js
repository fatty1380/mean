(function () {
    'use strict';

    angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$state', 'Authentication', '$timeout',
        function ($scope, $stateParams, $http, $state, Authentication, $timeout) {
            $scope.authentication = Authentication;

            //If user is signed in then redirect back home
            if ($scope.authentication.user) {
                $state.go('home');
            }

            // Submit forgotten password account id
            $scope.askForPasswordReset = function () {
                $scope.success = $scope.error = null;

                $http.post('api/auth/forgot', $scope.credentials).success(function (response) {
                    // Show user success message and clear form
                    $scope.credentials = null;
                    $scope.ct = 5;
                    $scope.success = response.message;
                    $scope.msg = ' in ' + $scope.ct;

                    function updateMsg(ct) {
                        ct--;

                        $scope.msg = ' in ' + ct;

                        if (ct > 0) {
                            return $timeout(function () {
                                updateMsg(ct);
                            }, 1000);
                        } else {
                            $state.go('home');
                        }
                    }

                    updateMsg($scope.ct);

                }).error(function (response) {
                    // Show user error message and clear form
                    $scope.credentials = null;
                    $scope.error = response.message;
                });
            };

            // Change user password
            $scope.resetUserPassword = function () {
                $scope.success = $scope.error = null;

                $http.post('api/auth/reset/' + $stateParams.token, $scope.passwordDetails)
                    .success(
                    function (response) {
                        // If successful show success message and clear form
                        $scope.passwordDetails = null;
                        $scope.success = 'Password Changed Successfully!';

                        // Attach user profile
                        Authentication.user = response;

                        function updateMsg(ct) {
                            ct--;

                            $scope.msg = ' in ' + ct;

                            if (ct > 0) {
                                return $timeout(function () {
                                    updateMsg(ct);
                                }, 1000);
                            } else {
                                $state.go('home');
                            }
                        }

                        // Route user to 'home' if this was the password reset form.
                        if ($state.is('password.reset.form')) {
                            updateMsg(6);
                        }

                    }).error(function (response) {
                        console.log('hmmm, that was\'nt suppoased to happen: ', response);
                        $scope.error = response.data && response.data.message || response.message || 'Sorry, an error occurred';
                    });
            };
        }
    ]);


})();
