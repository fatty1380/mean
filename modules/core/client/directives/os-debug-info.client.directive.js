(function () {
    'use strict';

    osDebugInfoCtrl.$inject = ['$scope', '$rootScope', '$location', '$state', '$log', 'Authentication', 'AppConfig'];
    function osDebugInfoCtrl($scope, $rootScope, $location, $state, $log, Auth, AppConfig) {

        $scope.debugInfo = [];
        $scope.collapsed = true;

        var enabled = !!AppConfig.get('debug');

        if (enabled && false) {

            var updateInfo = function (event, toState, toParams, fromState, fromParams) {

                $log.debug('[DebugInfo] Entering state: %o. %o', toState.name, toState);

                $scope.debugInfo.length = 0;

                if (!!toState && !!toState.name) {
                    $scope.debugInfo.push({
                        key: 'State',
                        value: toState.name
                    });
                }

                if (!!toState && !!toState.name) {
                    $scope.debugInfo.push({
                        key: 'Parent',
                        value: (toState.parent && toState.parent.name) || 'n/a'
                    });
                }

                $scope.debugInfo.push({
                    key: 'Path',
                    value: $location.$$path
                });

                $scope.debugInfo.push({
                    key: 'UserId',
                    value: Auth.user._id
                });
            };

            $scope.toggle = function () {
                $scope.collapsed = !$scope.collapsed;
            };

            $rootScope.$on('$stateChangeSuccess', updateInfo);
        } else {
            $log.info('not enabling os-debug-info');
        }
    }

    angular.module('core')
        .directive('osDebugInfo', [
            function () {
                return {
                    scope: {
                        pageName: '@?'
                    },
                    templateUrl: '/modules/core/views/templates/os-debug-info.client.template.html',
                    restrict: 'E',
                    replace: false,
                    controller: 'OsDebugInfoController'
                };
            }
        ])
        .controller('OsDebugInfoController', osDebugInfoCtrl);
})();
