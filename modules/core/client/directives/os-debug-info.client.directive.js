(function() {
    'use strict';

    angular.module('core')
        .directive('osDebugInfo', [
            function() {
                return {
                    scope: {
                        pageName: '@?'
                    },
                    templateUrl: 'modules/core/views/templates/os-debug-info.client.template.html',
                    restrict: 'E',
                    replace: false,
                    controller: 'OsDebugInfoController'
                };
            }
        ])
        .controller('OsDebugInfoController', ['$scope', '$rootScope', '$location', '$state', '$log', 'Authentication',

            function($scope, $rootScope, $location, $state, $log, Auth) {

                $scope.debugInfo = [];

                var updateInfo = function(event, toState, toParams, fromState, fromParams) {

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

                $rootScope.$on('$stateChangeSuccess', updateInfo);
            }
        ])
        .filter('sanitize', [
            '$sce',
            function($sce) {
                return function(htmlCode) {
                    return $sce.trustAsHtml(htmlCode);
                };
            }
        ]);
})();
