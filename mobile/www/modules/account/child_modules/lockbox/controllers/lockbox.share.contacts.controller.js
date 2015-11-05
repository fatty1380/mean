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
        vm.select = select;

        function select () {
            console.warn(' vm.selectedContact --->>>', vm.selectedContact);
            vm.closeModal(vm.selectedContact);
        }

    }
})();
