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
			link: link,
			controller: AddContactDirectiveCtrl,
			controllerAs: 'vm',
			bindToController: {
				contact: '=model',
				showMessage: '=?',
				showEmail: '=?',
				showPhone: '=?',
				showName: '=?'
			}
		};
		
		function link(scope, elem, attrs, vm) {
			vm.showEmail = vm.showEmail !== false;
			vm.showPhone = vm.showPhone !== false;
			vm.showMessage = vm.showMessage !== false;
			vm.showName = vm.showName !== false;
			
			vm.messagePlaceholder = vm.message || 'Enter a message to your recipient';
		}

		return directive;
	}


	AddContactDirectiveCtrl.$inject = ['contactsService'];
	function AddContactDirectiveCtrl(contactsService) {
		var vm = this;
		
		vm.pickContact = pickContact;
		
		function pickContact() {
			contactsService
				.pickContact()
				.then(function (selectedContact) {
					debugger;
					
					alert(JSON.stringify(selectedContact, null, 2));
					log.debug('Selected Contact: ', selectedContact);
					
					/**
					 * Contacts returned with teh following schemas:
					 * 'displayName' only available on android. 'formatted' may be used on ios
					 * emails and phones arrays store objects with the following keys:
					 * 		value : the email or phone number
					 * 		pref: boolean - true if preferred contact value
					 * 		id: appears to be index in array (ios)
					 * 		type: 'work', 'mobile', 'home', etc
					 * 
					 * Within the directve, the singular `email` or `phone` will be used to
					 * display the number to the users
					 */
					
					vm.contact = selectedContact;
					vm.contact.displayName = vm.contact.displayName || vm.contact.formatted;
					vm.contact.email == !!vm.contact.emails.length && vm.contact.emails[0].value;
					vm.contact.phone == !!vm.contact.phones.length && vm.contact.phones[0].value;
			})
		}
	}

	var contactTemplate = [
		' <div class="list list-inset">',
		'<pre>{{vm.selectedContact}}</pre>',
		'   <button class="button button-block" ng-click="vm.pickContact();">Choose from Contacts</button>', 
		'	<label class="item item-input" ng-if="!!vm.showPhone">',
		'		<span class="input-label">Phone</span>',
		'		<input type="tel" placeholder="Phone Number" ng-model="vm.contact.phone">',
		'	</label>',
		'	<label class="item item-input" ng-if="!!vm.showEmail">',
		'		<span class="input-label">Email</span>',
		'		<input type="email" placeholder="Email Address" ng-model="vm.contact.email">',
		'	</label>',
		'	<label class="item item-input" ng-if="!!vm.showName">',
		'		<span class="input-label">Name</span>',
		'		<input type="text" placeholder="Name" ng-model="vm.contact.displayName">',
		'	</label>',
		'   <label class="item item-input item-stacked-label" ng-if="!!vm.showMessage">',
		'		<span class="input-label">Message</span>',
        '       <textarea placeholder="{{vm.messagePlaceholder}}" class="" rows="10" ng-model="vm.contact.message"></textarea>',
        '   <hr></label>',
		'</div>'
	].join('');

})();
