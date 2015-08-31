(function() {
    'use strict';

    angular
        .module('account')
        .controller('LockboxShareRecipientCtrl', LockboxShareRecipientCtrl);

    LockboxShareRecipientCtrl.$inject = ['lockboxDocuments', 'contactsService'];

    function LockboxShareRecipientCtrl(lockboxDocuments, contactsService) {
        var vm = this;

        vm.lockboxDocuments = lockboxDocuments;
        vm.pickContact = pickContact;
        vm.deleteContact = deleteContact;
        vm.share = share;

        vm.selectedContacts = [];

        function pickContact() {
            console.log("pickContact()  ");
            contactsService.pickContact().then(
                function(contact) {
                    function isUnique(element){
                        return element.displayName != contact.displayName;
                    }
                    if( vm.selectedContacts.every(isUnique)){
                        vm.selectedContacts.push(contact);
                    }
                },
                function(failure) {
                    console.log("Failed to pick a contact. Not a device?");
                }
            );
        }

        function deleteContact(contact) {
            for(var i=0; i<vm.selectedContacts.length; i++){
                if(vm.selectedContacts[i].displayName === contact.displayName){
                    vm.selectedContacts.splice(i,1);
                    return;
                }
            }
        }

        function share() {
            console.log(' share() ');
        }
    }
})();
