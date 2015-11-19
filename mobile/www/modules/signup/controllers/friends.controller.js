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
            logger.error('Friends Controller: Handle State Change Error', error);
            logger.debug('event -->', event);
            logger.debug('toState -->', toState);
            logger.debug('fromState -->', fromState);
            logger.debug('error -->', error);

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
