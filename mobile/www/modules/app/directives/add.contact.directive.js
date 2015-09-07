(function () {
	'use strict';

	/**
	 * @desc Contact Add directive that can be used anywhere across apps to get/gather contact information from the user.
	 * @example <oset-manual-contact model="vm.contact" />
	 */
	angular.module(AppConfig.appModuleName)
		.directive('osetManualContact', AddContactDirective);


	function AddContactDirective() {
		var directive = {
			link: link,
			template: contactTemplate,
			restrict: 'E',
			scope: {
				contact: '=model'
			},
			controller: AddContactDirectiveCtrl,
			controllerAs: 'vm',
			bindToController: true
		}

		return directive;

		// Inject controller as 'vm' for consistency
		function link(scope, el, attr, vm) {
			// Set defaults in case vm.contact is not properly initialized
			angular.extend(vm.contact, {
				checked: true,
				displayName: null,
				phones: [],
				emails: []
			});
		}
	}


	AddContactDirectiveCtrl.$inject = [];
	function AddContactDirectiveCtrl() {
		var vm = this;




	}

	var contactTemplate = [
		'	<label class="item item-input">',
		'		<input type="tel" placeholder="Phone Number" ng-model="vm.contact.phones[0]">',
		'	</label>',
		'	<label class="item item-input">',
		'		<input type="email" placeholder="Email Address" ng-model="vm.contact.emails[0]">',
		'	</label>',
		'	<label class="item item-input">',
		'		<input type="text" placeholder="Name" ng-model="vm.contact.displayName">',
		'	</label>'
	].join('');

})();