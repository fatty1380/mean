(function () {
    'use strict';

    angular
        .module('signup')
        .controller('AddContactFriendsCtrl', AddContactFriendsCtrl);

    AddContactFriendsCtrl.$inject = ['$state', 'contactsService'];

    function AddContactFriendsCtrl($state, contactsService) {
        var vm = this;

        vm.contacts = [];

        vm.sendInvitations = sendInvitations;

        function sendInvitations() {
            $state.go('signup-welcome')
        }

        function chooseContacts() {
            vm.json = contactsService
                .find()
                .then(function (data) {
                    console.log('DATDATA', data);
                    vm.contacts = data;
                }, function (err) {
                    console.log(err);
                });
        }
        chooseContacts();

    }
})();
