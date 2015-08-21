(function () {

    function contactsService($q) {

        var formatContact = function(contact) {
            return {
                "displayName"   : contact.name.formatted || contact.name.givenName + " " + contact.name.familyName || "Person",
                "emails"        : contact.emails || [],
                "phones"        : contact.phoneNumbers || []
            };
        };

        var pickContact = function() {
            var deferred = $q.defer();
            if(navigator && navigator.contacts) {
                navigator.contacts.pickContact(function(contact){
                    deferred.resolve( formatContact(contact) );
                });
            } else {
                deferred.reject("Bummer.  No contacts in desktop browser");
            }
            return deferred.promise;
        };
        return {
            pickContact : pickContact
        };

    }

    contactsService.$inject = ['$q'];

    angular
        .module('signup')
        .factory('contactsService1', contactsService);
})();
