(function () {
	'use strict';

	/**
	 * @desc Contact Add directive that can be used anywhere across apps to get/gather contact information from the user.
	 * @example <oset-manual-contact model="vm.contact" />
	 */
	angular.module(AppConfig.appModuleName)
		.directive('osetToggle', ToggleDirective);


	function ToggleDirective() {
		return {
			template: contactTemplate,
			restrict: 'E',
			scope: {
				items: '=',
				type: '@',
				selected: '='
			},
			controller: ToggleDirectiveCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}


	ToggleDirectiveCtrl.$inject = [];
	function ToggleDirectiveCtrl() {
		var vm = this;

		vm.selected = null;
		vm.select = select;

		function select (item) {
			vm.selected = item;
		}
	}

	var contactTemplate = [
		'<div class="toggle-block button-bar"> ' +
		'	<button class="button {{vm.type}}" ng-class="{active: (vm.selected && vm.selected === item)}" ng-repeat="item in vm.items" ng-click="vm.select(item)">{{item}}</button> ' +
		'</div>'
	].join('');

})();
