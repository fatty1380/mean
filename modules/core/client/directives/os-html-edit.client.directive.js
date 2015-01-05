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
                    model: '=',
                    toolbar: '=?'
                },
                controllerAs: 'vm',
                bindToController: true,
                controller: function($scope, $element, $attrs, $transclude) {
                    var vm = this;
                    var toolbar = vm.toolbar || [
                        ['h1', 'h2', 'h3', 'p'],
                        ['bold', 'italics', 'underline'],
                        ['ul', 'ol'],
                        ['indent', 'outdent'],
                        ['justifyLeft', 'justifyCenter', 'justifyRight']
                    ];

                    $scope.toolbar = JSON.stringify(toolbar);
                }
            };
        }]);


})();
