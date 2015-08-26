(function () {

    angular
        .module(AppConfig.appModuleName)
        .factory('contactsService', contactsService);

    contactsService.$inject = ['$q', '$filter'];

    function contactsService($q, $filter) {

        var contacts = [];

        function addNewContact(contact) {
            if(contact && (contact.phones || contact.emails)){
                contacts.push(contact)
            }
        }

        function getContactList() {
            return contacts;
        }


        function getContacts() {
            var filter = $filter('getContacts');

            return find().then(function (data) {
                contacts = filter(data);
                return contacts;
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
            if(navigator && navigator.contacts) {
                var fields = options && options.fields || ['id', 'displayName'];
                if (options && Object.keys(options).length === 0) {
                    navigator.contacts.find(fields, function (results) {
                        q.resolve(results);
                    },function (err) {
                        q.reject(err);
                    });
                }
                else {
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

        function pickContact () {
            var q = $q.defer();

            if(navigator && navigator.contacts) {
                navigator.contacts.pickContact(function(contact){
                    q.resolve(contact);
                });
            } else {
                q.reject("No contacts in desktop browser");
            }

            return q.promise;
        }

        return {
            contacts: contacts,
            getContactList: getContactList,
            getContacts: getContacts,
            addNewContact: addNewContact,
            save: save,
            clone: clone,
            remove: remove,
            find: find,
            pickContact: pickContact
        };
    }
})();
