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
			bindToController: true,
			scope: {
				contact: '=model',
				showMessage: '=?',
				showEmail: '=?',
				showPhone: '=?',
				showName: '=?',
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
					
					//alert(JSON.stringify(selectedContact, null, 2));
					console.log('Selected Contact: ', selectedContact);
					
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
					
					vm.contact.emails = selectedContact.emails;
					vm.contact.phoneNumbers = selectedContact.phoneNumbers;
					vm.contact.firstName = selectedContact.name && selectedContact.name.givenName;
					vm.contact.lastName = selectedContact.name && selectedContact.name.familyName;
					vm.contact.displayName = selectedContact.displayName || selectedContact.name && selectedContact.name.formatted;
					
					vm.contact.email = !!vm.contact.emails && !!vm.contact.emails.length && vm.contact.emails[0].value || null;
					vm.contact.phone = !!vm.contact.phoneNumbers && !!vm.contact.phoneNumbers.length && vm.contact.phoneNumbers[0].value || null;
			})
		}
	}

	var contactTemplate = [
		'<div class="list list-inset share-form">',
		'   <button class="button button-block button-light" ng-click="vm.pickContact();">Choose from Contacts</button>', 
		'	<label class="item item-input" ng-if="!!vm.showPhone">',
		'		<span class="input-label">Phone</span>',
		'		<input type="tel" placeholder="Phone Number" ng-model="vm.contact.phone">',
		'		<i class="icon ion-ios-telephone"></i>',
		'	</label>',
		'	<label class="item item-input" ng-if="!!vm.showEmail">',
		'		<span class="input-label">Email</span>',
		'		<input type="email" placeholder="Email Address" ng-model="vm.contact.email">',
		'		<i class="icon ion-ios-email"></i>',
		'	</label>',
		'	<label class="item item-input" ng-if="!!vm.showName">',
		'		<span class="input-label">Name</span>',
		'		<input type="text" placeholder="Name" ng-model="vm.contact.displayName">',
		'		<i class="icon ion-ios-person"></i>',
		'	</label>',
		'   <label class="item item-input item-stacked-label multiline" ng-if="!!vm.showMessage">',
		'		<span class="input-label">Message</span>',
		'		<i class="icon ion-ios-compose"></i>',
        '       <textarea msd-elastic placeholder="{{vm.messagePlaceholder}}" class="" ng-model="vm.contact.message"></textarea>',
        '   </label>',
		'</div>'
	].join('');

})();
