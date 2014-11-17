(function() {
    'use strict';

    angular.module('core')
        .directive('loginModal', [
            function() {
                return {
                    transclude: true,
                    templateUrl: 'modules/core/views/templates/login-modal.client.template.html',
                    restrict: 'EA',
                    scope: {
                        signin: '&',
                        title: '@?'
                    },
                    controller: 'LoginModalController'
                };
            }
        ])
        .controller('LoginModalController', function($scope, $modal, $log) {

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


        })
        .directive('modalFocus', function($timeout, $parse) {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {
                    var model = $parse(attrs.modalFocus);

                    scope.$watch(model, function(value) {
                        console.log('value=', value);
                        if (value === true) {
                            $timeout(function() {
                                element[0].focus();
                            });
                        }
                    });

                    console.log('focus on ' + attrs.focusMe);

                    //                    if (attrs.focusMe) {
                    //                        $timeout(functino() {
                    //                            element[0].focus();
                    //                        });
                    //                    }
                }
            };
        });

})();
