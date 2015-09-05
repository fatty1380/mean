(function () {
    'use strict';

    angular
        .module('signup')
        .controller('AddFriendManuallyCtrl', AddFriendManuallyCtrl);

    AddFriendManuallyCtrl.$inject = ['$state', 'contactsService'];

    function AddFriendManuallyCtrl($state, contactsService) {
        var vm = this;

        vm.invite = invite;
        vm.cancel = cancel;

        init();

        function init() {
            vm.contact = {};
        }

        function invite() {
            return contactsService.addContact(vm.contact)
                .then(function () {
                    return $state.go('signup-friends-contacts');
                });
        }

        function cancel() {
            //$state.go('signup.friends');
        }

    }

})();
