(function () {
    'use strict';

    angular
        .module('signup')
        .controller('AddContactFriendsCtrl', AddContactFriendsCtrl);

    AddContactFriendsCtrl.$inject = ['$state', 'contactsService'];

    function AddContactFriendsCtrl($state, contactsService) {
        var vm = this;

        vm.contacts = [];

        console.log(contactsService);

        function chooseContacts() {
            vm.json = contactsService
                .find()
                .then(function (data) {
                    console.log(data);
                    vm.contacts = data;
                }, function (err) {
                    console.log(err);
                });
        }
        chooseContacts();

    }
})();
