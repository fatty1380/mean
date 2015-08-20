(function () {
    'use strict';

    angular
        .module('signup')
        .controller('SignupFriendsCtrl', SignupFriendsCtrl);

    SignupFriendsCtrl.$inject = ['$state'];

    function SignupFriendsCtrl($state) {
        console.log('132312312');
        var vm = this;

        vm.chooseContacts = chooseContacts;
        vm.addManualy = addManualy;
        vm.skip = skip;

        function chooseContacts () {
            $state.go('signup/friends/contacts');
        }

        function skip() {
            $state.go('account.profile');
        }

        function addManualy() {
            $state.go('signup/friends/manually');
        }

    }
})();
