(function () {
    'use strict';

    angular
        .module('signup')
        .controller('SignupFriendsCtrl', SignupFriendsCtrl);

    SignupFriendsCtrl.$inject = ['$state'];

    function SignupFriendsCtrl($state) {
        var vm = this;

        vm.chooseContacts = chooseContacts;
        vm.addManualy = addManualy;
        vm.skipToProfile = skipToProfile;

        function chooseContacts () {
            $state.go('signup-friends-contacts');
        }

        function skipToProfile() {
            $state.go('account.profile');
        }

        function addManualy() {
            $state.go('signup-friends-manually');
        }

    }
})();
