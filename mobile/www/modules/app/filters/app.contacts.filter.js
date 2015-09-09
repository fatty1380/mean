(function () {
    'use strict';

    angular
        .module(AppConfig.appModuleName)
        .filter('contactsFilter', contactsFilter);

    function contactsFilter() {
        return function (allContacts) {
            var contacts = [],
                contact, formattedContact, i,
                displayName, phones, emails, conditions;

            for(i = 0; i < allContacts.length; i++){
                contact = allContacts[i];

                conditions =  contact.emails && contact.emails.length || contact.phoneNumbers && contact.phoneNumbers.length;
                if(conditions){
                    displayName = (contact.name.formatted || contact.name.givenName + " " + contact.name.familyName || "Person").trim();
                    emails = getEmail(contact.emails);
                    phones = getPhoneNumbers(contact.phoneNumbers);

                    formattedContact = {
                        "displayName": displayName,
                        "emails": emails,
                        "phones": phones
                    };
                    contacts.push(formattedContact);
                }
            }

            function getEmail(emails) {
                return emails && emails[0].value || '';
            }

            function getPhoneNumbers(phones) {
                if (!phones || !phones.length) return [];

                var formattedPhone,
                    phoneArray = [];

                for(var j = 0; j < phones.length; j++){
                    formattedPhone = {};
                    formattedPhone[phones[j].type] = phones[j].value;
                    phoneArray.push(formattedPhone);
                }

                return phoneArray;
            }

            return contacts;
        }
    }

})();
