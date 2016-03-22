(function () {
    'use strict';

	/**
	 * @desc Toggle directive that can be used anywhere across apps to get/gather contact information from the user.
	 * @example <tline-toggle label="Owner Operator" type="button-small" model="vm.owner"></tline-toggle>
	 */
    angular.module(AppConfig.appModuleName)
        .directive('tlineToggle', ToggleDirective);


    function ToggleDirective () {
        return {
            template: contactTemplate,
            restrict: 'E',
            scope: {
                label: '@',
                type: '@',
                selected: '=model'
            },
            controller: ToggleDirectiveCtrl,
            controllerAs: 'vm',
            bindToController: true
        };
    }


    ToggleDirectiveCtrl.$inject = [];
    function ToggleDirectiveCtrl () {
        var vm = this;

        vm.toggle = toggle;

        function toggle (value) {
            vm.selected = value;
        }
    }

    var contactTemplate = [
        '<div class="toggle-block"> ',
        '<strong ng-if="!!vm.label" class="label">{{vm.label}}</strong>',
        '<div class="button-bar"> ',
        '<button class="button {{vm.type}}" ng-class="{active: (vm.selected === false)}" ng-click="vm.toggle(false)" type="button">No</button>',
        '<button class="button {{vm.type}}" ng-class="{active: (vm.selected === true)}" ng-click="vm.toggle(true)" type="button">Yes</button>',
        '</div>',
        '</div>'
    ].join('');

})();
