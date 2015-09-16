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
			template: contactTemplate,
			restrict: 'E',
			scope: {
				contact: '=model',
				message: '=?'
			},
			controller: AddContactDirectiveCtrl,
			controllerAs: 'vm',
			bindToController: true
		};

		return directive;
	}


	AddContactDirectiveCtrl.$inject = [];
	function AddContactDirectiveCtrl() {
		//var vm = this;
	}

	var contactTemplate = [
		'	<label class="item item-input">',
		'		<input type="tel" placeholder="Phone Number" ng-model="vm.contact.phones[0]">',
		'	</label>',
		'	<label class="item item-input">',
		'		<input type="email	" placeholder="Email Address" ng-model="vm.contact.emails">',
		'	</label>',
		'	<label class="item item-input">',
		'		<input type="text" placeholder="Name" ng-model="vm.contact.displayName">',
		'	</label>',
		'   <label class="item item-input" ng-if="!!vm.message">',
        '       <textarea placeholder="Enter message" class="" rows="10" ng-model="vm.contact.message"></textarea>',
        '   <hr></label>'
	].join('');

})();
