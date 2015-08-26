(function () {
    'use strict';

    angular
        .module('signup')
        .filter('getContacts', getContacts);

    function getContacts() {
        return function (allContacts) {
            var contacts = [],
                contact, formattedContact, i;

            for(i = 0; i < allContacts.length; i++){
                contact = allContacts[i];
                if (contact.phoneNumbers || contact.phoneNumbers){
                    formattedContact = {
                        "displayName": contact.name.formatted || contact.name.givenName + " " + contact.name.familyName || "Person",
                        "emails": contact.emails || [],
                        "phones": contact.phoneNumbers || []
                    };
                    contacts.push(formattedContact);
                }
            }

            return contacts;
        }
    }

})();
