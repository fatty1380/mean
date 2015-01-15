(function() {
    'use strict';

    function SigninModalDirective() {
        return {
            transclude: true,
            templateUrl: 'modules/users/views/templates/login-modal.client.template.html',
            restrict: 'EA',
            scope: {
                signin: '&',
                title: '@?'
            },
            controller: 'LoginModalController'
        };
    }

    function SigninModalController($scope, $modal, $log) {

        $scope.isOpen = false;

        $scope.showLogin = function() {
            var modalInstance = $modal.open({
                templateUrl: 'loginModal.html',
                controller: 'AuthenticationController'
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
    }


    SigninModalController.$inject = ['$scope', '$modal', '$log'];

    angular.module('users')
        .directive('loginModal', SigninModalDirective)
        .controller('LoginModalController', SigninModalController);

})();
