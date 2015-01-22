(function() {
    'use strict';

    angular.module('core')
        .directive('osHtmlEdit', [function() {
            return {
                priority: 0,
                template: '<text-angular ng-model="vm.model" ta-toolbar="vm.toolbar" required="vm.required" ta-toolbar-button-class="ta-toolbar-btn btn btn-cta-toolbar"></text-angular>',
                replace: false,
                restrict: 'E',
                scope: {
                    model: '=',
                    toolbar: '=?',
                    osRequired: '=?'
                },
                controllerAs: 'vm',
                bindToController: true,
                controller: function($scope, $element, $attrs, $transclude) {
                    var vm = this;
                    var toolbar = vm.toolbar || [['bold', 'italics', 'underline'], ['ul','ol'], ['justifyLeft', 'justifyCenter']];

                    vm.required = _.isUndefined(vm.osRequired) ? false : !!vm.osRequired;

                    vm.toolbar = toolbar;
                }
            };
        }]);


})();

