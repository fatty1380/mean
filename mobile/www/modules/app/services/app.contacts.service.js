(function () {

    angular
        .module(AppConfig.appModuleName)
        .factory('contactsService', contactsService);

    contactsService.$inject = ['$q', '$filter', 'LoadingService'];

    function contactsService ($q, $filter, LoadingService) {

        logger.info('Contact Service INITIALIZING');
        var contacts = [],
            deviceContactsLoaded = false,
            filter = $filter('contactsFilter');

        // SM for Service Model
        var sm = {
            contacts: []
        };

        return {
            getContacts: function () { return sm.contacts; },
            isResolved: function () { return deviceContactsLoaded; },

            resolveContacts: resolveContacts,
            loadContacts: loadContacts,
            loadOrResolveContacts: loadOrResolveContacts,
            retrieveContacts: retrieveContacts,
            addContact: addContact,
            setContacts: setContacts,
            save: save,
            clone: clone,
            remove: remove,
            find: find,
            pickContact: pickContact,

            deviceContactsLoaded: deviceContactsLoaded
        };

        function setContacts (newContacts) {
            if (newContacts) {
                sm.contacts = newContacts;
            }
            return sm.contacts;
        }

        /**
         * addContact
         * Adds a contact to the 'local' service's contacts array. Does **NOT** add to device contacts.
         */
        function addContact (contact) {
            if (angular.isArray(contact)) {
                sm.contacts.concat(contact);
            } else {
                if (contact && (contact.phoneNumbers || contact.emails)) {
                    contact.checked = true;
                    sm.contacts.unshift(contact);
                }
                else if (contact && (contact.phone || contact.email)) {
                    contact.emails = !!contact.email ? [{ value: contact.email, type: 'manual' }] : [];
                    contact.phoneNumbers = !!contact.phone ? [{ value: contact.phone, type: 'manual' }] : [];

                    var pore = (contact.phone || contact.email);

                    contact.displayName = contact.displayName || !!pore && pore.value || pore;

                    contact.checked = true;

                    contact.id = contact.id || 'manual' + Math.floor(10000 * Math.random() + 1000);

                    sm.contacts.unshift(contact);
                }
            }
            return $q.when(sm.contacts);
        }

        function loadContacts (resolve) {
            return loadOrResolveContacts(resolve);
        }

        function resolveContacts () {
            return loadOrResolveContacts(true);
        }

        function loadOrResolveContacts (resolve) {
            if (resolve && (!deviceContactsLoaded || !sm.contacts.length)) {
                LoadingService.showLoader('Loading Contacts<br><small>(this may take a moment)</small>');
                return retrieveContacts()
                    .finally(LoadingService.hide);
            }

            return $q.when(sm.contacts);
        }


        function retrieveContacts () {
            return find().then(
                function (data) {
                    var newContacts = filter(data);
                    logger.warn(' retrieveContacts() --->>>', newContacts);

                    sm.contacts = _(sm.contacts.concat(newContacts)).uniq(function (c) {
                        return c.id || 'manual-' + Math.floor(10000 * Math.random() + 1000);
                    }).value();

                    deviceContactsLoaded = true;

                    return sm.contacts;
                })
                .catch(function (err) {
                    logger.debug('error retrieving contacts', err);

                    return (sm.contacts = sm.contacts || []);
                });
        }

        function save (contact) {
            var q = $q.defer();
            var deviceContact = navigator.contacts.create(contact);

            deviceContact.save(function (result) {
                q.resolve(result);
            }, function (err) {
                q.reject(err);
            });
            return q.promise;
        }

        function remove (contact) {
            var q = $q.defer();
            var deviceContact = navigator.contacts.create(contact);

            deviceContact.remove(function (result) {
                q.resolve(result);
            }, function (err) {
                q.reject(err);
            });
            return q.promise;
        }

        function clone (contact) {
            var deviceContact = navigator.contacts.create(contact);
            return deviceContact.clone(contact);
        }

        function find (options) {
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
                q.reject('No contacts in desktop browser');
            }
            return q.promise;
        }

        function pickContact () {
            var q = $q.defer();

            if (navigator && navigator.contacts) {
                navigator.contacts.pickContact(function (contact) {
                    q.resolve(contact);
                });
            } else {
                q.reject('No contacts in desktop browser');
            }

            return q.promise;
        }
    }
})();
