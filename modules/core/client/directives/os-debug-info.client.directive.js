(function () {
    'use strict';

    function osDebugInfoCtrl($scope, $rootScope, $location, $state, $log, Auth, AppConfig) {

        $scope.debugInfo = [];
        $scope.collapsed = true;

        var enabled = AppConfig.get('debug');
        $log.error('Debug is : %o', enabled);
        if (!!($scope.enabled = false)) {

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
        }
    }

    osDebugInfoCtrl.$inject = ['$scope', '$rootScope', '$location', '$state', '$log', 'Authentication', 'AppConfig'];

    angular.module('core')
        .directive('osDebugInfo', [
            function () {
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
        .controller('OsDebugInfoController', osDebugInfoCtrl)

        .filter('sanitize', [
            '$sce',
            function ($sce) {
                return function (htmlCode) {
                    return $sce.trustAsHtml(htmlCode);
                };
            }
        ])
        .filter('streamline', [
            '$sce',
            function ($sce) {
                return function (htmlCode) {
                    var hRegex = /<(\/?)h\d>/;
                    var eRegex = /<[^\/]+?><\/.+?>|<br[\/]?>/;
                    var pRegex = /<(p).*?>([^<]*)<\/(p)>|<(ul|li).*?>([^<][^u]?[^l][^i]?)+<\/(ul|li)>/;

                    var result = htmlCode.replace(eRegex, '');

                    while (result.match(eRegex)) {
                        //console.log('Replacing Empty %o', result.match(eRegex));
                        result = result.replace(eRegex, '');
                    }
                    while (result.match(hRegex)) {
                        //console.log('Replacing Headers %o', result.match(hRegex));
                        result = result.replace(hRegex, '<$1b>');
                    }
                    while (result.match(pRegex)) {
                        //console.log('Replacing <p>s %o', result.match(pRegex));
                        result = result.replace(pRegex, '&nbsp;$2');
                    }
                    return $sce.trustAsHtml(result);
                };
            }
        ])
    ;
})();
