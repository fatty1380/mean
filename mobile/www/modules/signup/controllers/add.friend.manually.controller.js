(function () {
    'use strict';

    angular
        .module('signup')
        .controller('AddFriendManuallyCtrl', AddFriendManuallyCtrl);

    AddFriendManuallyCtrl.$inject = ['$state'];

    function AddFriendManuallyCtrl($state) {
        var vm = this;

        vm.invite = invite;
        vm.cancel = cancel;

        function invite() {
            $state.go('signup-friends-contacts');
        }

        function cancel() {
            //$state.go('signup.friends');
        }

    }

})();
