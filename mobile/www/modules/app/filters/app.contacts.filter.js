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
            return _(allContacts).map(processContact).filter(_.isObject).value();
        }

        function processContact(contact) {
            var conditions = contact.emails && contact.emails.length || contact.phoneNumbers && contact.phoneNumbers.length;
            if (conditions) {
                return {
                    "id": contact.id,
                    "displayName": (contact.name.formatted || contact.name.givenName + " " + contact.name.familyName || "Contact" + contact.id).trim(),
                    "emails": getEmail(contact.emails),
                    "phoneNumbers": getPhoneNumbers(contact.phoneNumbers)
                };
            }
            return null;
        }

        function getEmail(emails) {
            if (!emails || !emails.length) return [];
            
            var emailArray = [];
            var e;

            for (var j = 0; j < emails.length; j++) {
                if (!_.isEmpty(e = emails[j])) {
                    emailArray.push({
                        value: e.value,
                        type: e.type,
                        pref: e.pref
                    });
                }
            }

            return emailArray;
            
            
        }

        function getPhoneNumbers(phones) {
            if (!phones || !phones.length) return [];

            var phoneArray = [];
            var p;

            for (var j = 0; j < phones.length; j++) {
                if (!_.isEmpty(p = phones[j])) {
                    phoneArray.push({
                        value: p.value,
                        type: p.type,
                        pref: p.pref
                    });
                }
            }

            return phoneArray;
        }
    }

})();
