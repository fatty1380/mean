(function () {
    'use strict';
    
    /**
     * Part of Signup Flow --> TODO: Replace with Add Friends Modal
     */

    angular
        .module('signup')
        .controller('AddFriendManuallyCtrl', AddFriendManuallyCtrl);

    AddFriendManuallyCtrl.$inject = ['$state', 'contactsService', '$ionicPopup'];

    function AddFriendManuallyCtrl($state, contactsService, $ionicPopup) {
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
                    var config = {
                        title: 'Success!',
                        template : 'An invitation has been sent to ' + vm.contact.name || vm.contact.email && vm.contact.email.value || vm.contact.phone && vm.contact.phone.value
                    }

                    return $ionicPopup.alert(config);
                })
                .then(function() {
                    return $state.go('signup-friends-contacts');
                });
        }

        function cancel() {
            return $state.go('signup-friends-contacts');
        }

    }

})();
