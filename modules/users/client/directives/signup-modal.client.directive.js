(function() {
    'use strict';

    angular.module('users')
        .directive('signupModal', [
            function() {
                return {
                    transclude: true,
                    templateUrl: 'modules/users/views/templates/signup-modal.client.template.html',
                    restrict: 'EA',
                    scope: {
                        signin: '&',
                        title: '@?'
                    },
                    controller: 'SignupModalController'
                };
            }
        ])
        .controller('SignupModalController', function($scope, $modal, $log) {

            $scope.isOpen = false;

            $scope.showSignup = function() {
                var modalInstance = $modal.open({
                    templateUrl: 'signupModal.html',
                    controller: 'AuthenticationController',
                    size: 'lg'
                });

                modalInstance.result.then(function(result) {
                    $log.info('Modal result %o', result);
                    $scope.isOpen = false;
                }, function(result) {
                    $log.info('Modal dismissed at: ' + new Date());
                    $scope.isOpen = false;
                });

                modalInstance.opened.then(function(args) {
                    $scope.isOpen = true;
                });
            };


        });

})();
