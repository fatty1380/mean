(function () {

    angular
        .module(AppConfig.appModuleName)
        .factory('contactsService', contactsService);

    contactsService.$inject = ['$q', '$filter'];

    function contactsService($q, $filter) {

        debugger;
        var contacts = [],
            filter = $filter('contactsFilter');

        return {
            getContacts: getContacts,
            retrieveContacts: retrieveContacts,
            addContact: addContact,
            setContacts: setContacts,
            save: save,
            clone: clone,
            remove: remove,
            find: find,
            pickContact: pickContact
        };

        function getContacts() {
            return contacts;
        }

        function setContacts(newContacts) {
            if (newContacts) {
                contacts = newContacts;
            }
            return contacts;
        }

        /**
         * addContact
         * Adds a contact to the 'local' service's contacts array. Does **NOT** add to device contacts.
         */
        function addContact(contact) {
            if (angular.isArray(contact)) {
                contacts.concat(contact);
            } else {
                if (contact && (contact.phones || contact.emails)) {
                    contacts.push(contact)
                }
                else if (contact && (contact.phone || contact.email)) {
                    contact.emails = !!contact.email ? [{ value: contact.email, type: 'manual' }] : [];
                    contact.phones = !!contact.phone ? [{ value: contact.phone, type: 'manual' }] : [];

                    var pore = (contact.phone || contact.email);
                    debugger;

                    contact.displayName = contact.displayName || !!pore && pore.value || pore;

                    contact.checked = true;

                    contacts.push(contact);
                }
            }
            return $q.when(contacts);
        }


        function retrieveContacts() {
            return find().then(
                function (data) {
                    contacts = filter(data);
                    console.warn(' getContacts() --->>>', getContacts());
                })
                .catch(function (err) {
                    console.log('error retrieving contacts', err);

                    contacts = contacts || [];
                });
        }

        function save(contact) {
            var q = $q.defer();
            var deviceContact = navigator.contacts.create(contact);

            deviceContact.save(function (result) {
                q.resolve(result);
            }, function (err) {
                q.reject(err);
            });
            return q.promise;
        }

        function remove(contact) {
            var q = $q.defer();
            var deviceContact = navigator.contacts.create(contact);

            deviceContact.remove(function (result) {
                q.resolve(result);
            }, function (err) {
                q.reject(err);
            });
            return q.promise;
        }

        function clone(contact) {
            var deviceContact = navigator.contacts.create(contact);
            return deviceContact.clone(contact);
        }

        function find(options) {
            var q = $q.defer();
            if (navigator && navigator.contacts) {
                var fields = options && options.fields || ['id', 'displayName'];
                if (options && Object.keys(options).length === 0) {
                    navigator.contacts.find(fields, function (results) {
                        q.resolve(results);
                    }, function (err) {
                        q.reject(err);
                    });
                } else {
                    navigator.contacts.find(fields, function (results) {
                        q.resolve(results);
                    }, function (err) {
                        q.reject(err);
                    }, options);
                }
            } else {
                q.reject("No contacts in desktop browser");
            }
            return q.promise;
        }

        function pickContact() {
            var q = $q.defer();

            if (navigator && navigator.contacts) {
                navigator.contacts.pickContact(function (contact) {
                    q.resolve(contact);
                });
            } else {
                q.reject("No contacts in desktop browser");
            }

            return q.promise;
        }
    }
})();
