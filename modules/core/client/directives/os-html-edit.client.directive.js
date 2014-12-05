(function() {
    'use strict';

    angular.module('core')
        .directive('osHtmlEdit', [function() {
            return {
                priority: 0,
                template: '<text-angular ng-model="model" ta-toolbar="{{toolbar}}"></text-angular>',
                replace: false,
                restrict: 'E',
                scope: {
                    model: '='
                },
                controller: function($scope, $element, $attrs, $transclude) {
                    $scope.toolbar = '[[\'h1\',\'h2\',\'h3\'],[\'ul\',\'ol\'],[\'indent\',\'outdent\'],[\'justifyLeft\',\'justifyCenter\']]';
                }
            };
        }]);


})();
