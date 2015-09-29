(function () {
    'use strict';
    
    /**
     * contactsFilter
     * Contact must have at least one email or phone number. This filter ensures that
     */

    angular
        .module(AppConfig.appModuleName)
        .filter('contactsFilter', contactsFilter);

    function contactsFilter() {
        return function (allContacts) {
            var contacts = [],
                contact, formattedContact, i,
                displayName, phoneNumbers, emails, conditions;

            for(i = 0; i < allContacts.length; i++){
                contact = allContacts[i];

                conditions =  contact.emails && contact.emails.length || contact.phoneNumbers && contact.phoneNumbers.length;
                if(conditions){
                    displayName = (contact.name.formatted || contact.name.givenName + " " + contact.name.familyName || "Person").trim();
                    emails = getEmail(contact.emails);
                    phoneNumbers = getPhoneNumbers(contact.phoneNumbers);

                    formattedContact = {
                        "displayName": displayName,
                        "emails": emails,
                        "phoneNumbers": phoneNumbers
                    };
                    contacts.push(formattedContact);
                }
            }

            function getEmail(emails) {
                return emails && emails[0].value || '';
            }

            function getPhoneNumbers(phones) {
                if (!phones || !phones.length) return [];

                var phoneArray = [];

                for(var j = 0; j < phones.length; j++){
                    phoneArray.push(phones[j].value);
                }

                return phoneArray;
            }

            return contacts;
        }
    }

})();
