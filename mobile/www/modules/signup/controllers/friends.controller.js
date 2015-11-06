(function () {
    'use strict';

    angular
        .module('signup')
        .controller('SignupFriendsCtrl', SignupFriendsCtrl);

    SignupFriendsCtrl.$inject = ['$state', '$rootScope', 'registerService'];

    function SignupFriendsCtrl($state, $rootScope, registerService) {
        var vm = this;

        vm.chooseContacts = chooseContacts;
        vm.addManually = addManually;
        vm.skipToProfile = skipToProfile;

        $rootScope.$on('$stateChangeError', handleStateChangeError);

        function handleStateChangeError(event, toState, toParams, fromState, fromParams, error) {
            console.error('Friends Controller: Handle State Change Error', error);
            console.log('event -->', event);
            console.log('toState -->', toState);
            console.log('fromState -->', fromState);
            console.log('error -->', error);

            if (fromState && fromState.name === 'signup-friends') {
                $state.go('signup-friends-contacts');
            }
        }

        function chooseContacts() {
            $state.go('signup-friends-contacts', { resolveContacts: true });
        }

        function skipToProfile() {
            // No changes within the friends controller - no saving required
            // single responsibility pattern ftw!
            $state.go('account.profile');
        }

        function addManually() {
            $state.go('signup-friends-manually');
        }

    }
})();
