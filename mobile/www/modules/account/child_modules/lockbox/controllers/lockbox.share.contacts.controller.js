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
        vm.closeModal = closeModal;
        vm.select = select;


        function closeModal (contacts) {
            $scope.closeModal(contacts);
        }

        function select () {
            console.warn(' vm.selectedContact --->>>', vm.selectedContact);
            closeModal(vm.selectedContact);
        }

    }
})();
