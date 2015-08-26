(function () {
    'use strict';

    angular.module('users').controller('ChangePasswordController', ['$scope', '$http', 'Users', 'Authentication', '$state', '$timeout',
        function ($scope, $http, Users, Authentication, $state, $timeout) {
            $scope.user = Authentication.user;

            // Change user password
            $scope.changeUserPassword = function () {
                $scope.success = $scope.error = null;

                $http.post('api/users/password', $scope.passwordDetails).success(function (response) {
                    // If successful show success message and clear form
                    $scope.success = 'Password successfully changed.';
                    $scope.passwordDetails = null;


                    $scope.ct = 5;
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
                    $scope.error = response.message;
                });
            };
        }
    ]);


})();
