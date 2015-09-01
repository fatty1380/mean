(function () {
    'use strict';

    angular
        .module('signup')
        .filter('getSelectedContacts', getSelectedContacts);

    function getSelectedContacts() {
        return function (allContacts) {
            var contacts = [],
                contact, i;

            for(i = 0; i < allContacts.length; i++){
                contact = allContacts[i];
                if (contact.checked){
                    delete contact.checked;
                    contacts.push(contact);
                }
            }

            return contacts;
        }
    }

})();
