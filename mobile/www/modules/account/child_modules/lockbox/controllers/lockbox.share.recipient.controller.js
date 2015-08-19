(function() {
    'use strict';

    angular
        .module('account')
        .controller('LockboxShareRecipientCtrl', LockboxShareRecipientCtrl);

    LockboxShareRecipientCtrl.$inject = ['lockboxDocuments', 'contactsService'];

    function LockboxShareRecipientCtrl(lockboxDocuments, contactsService) {
        var vm = this;

        vm.lockboxDocuments = lockboxDocuments;

        vm.share = function () {
            console.log(' share() ');
        }

        vm.selectedContacts = [];
        //vm.selectedContacts = [{displayName:"Petya"},{displayName:"John"},{displayName:"Maria"},{displayName:"Nick"}];

        vm.pickContact = function() {
            console.log("pickContact()  ");
            contactsService.pickContact().then(
                function(contact) {
                    function isUnique(element, index, array){
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

        vm.deleteContact = function (contact) {
            for(var i=0; i<vm.selectedContacts.length; i++){
                if(vm.selectedContacts[i].displayName === contact.displayName){
                    vm.selectedContacts.splice(i,1);
                    return;
                }
            }
        }
    }

})();
