(function () {
    'use strict';

    angular.module('users').controller('ChangePasswordController', ['$scope', '$http', 'Users', 'Authentication', '$state', '$timeout',
        function ($scope, $http, Users, Authentication, $state, $timeout) {
            $scope.user = Authentication.user;

            // Change user password
            $scope.changeUserPassword = function () {
                $scope.success = $scope.error = null;

                $http.post('/api/users/password', $scope.passwordDetails).success(function (response) {
                    // If successful show success message and clear form
                    $scope.success = true;
                    $scope.passwordDetails = null;

                    $timeout(function () {
                        $state.go('home', {'delay': 5});
                    }, (5000));
                }).error(function (response) {
                    $scope.error = response.message;
                });
            };
        }
    ]);


})();
