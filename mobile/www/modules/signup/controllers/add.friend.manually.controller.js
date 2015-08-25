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

        function invite() {
            var contact = {
                displayName: vm.displayName,
                phones: [{value: vm.phone }],
                emails: [{value: vm.email }]
            };

            console.log('invite new Contact --- >>>', contact);
            contactsService.addNewContact(contact);

            $state.go('signup-friends-contacts');
        }

        function cancel() {
            //$state.go('signup.friends');
        }

    }

})();
