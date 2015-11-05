(function() {
    'use strict';

    angular
        .module('account')
        .controller('LockboxShareContactsCtrl', LockboxShareContactsCtrl);

    LockboxShareContactsCtrl.$inject = ['$scope', 'contactsService'];

    function LockboxShareContactsCtrl($scope, contactsService) {
        var vm = this;
        vm.selectedContact = '';

        vm.contacts = contactsService.getContacts();
        vm.cancel = cancel;
        vm.select = select;


        function cancel () {
            vm.cancelModal();
        }

        function select () {
            console.warn(' vm.selectedContact --->>>', vm.selectedContact);
            vm.closeModal(vm.selectedContact);
        }

    }
})();
