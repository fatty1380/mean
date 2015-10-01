(function () {
    'use strict';

    angular
        .module('signup')
        .controller('SignupFriendsCtrl', SignupFriendsCtrl);

    SignupFriendsCtrl.$inject = ['$state', '$rootScope', 'registerService'];

    function SignupFriendsCtrl($state, $rootScope, registerService) {
        var vm = this;

        vm.chooseContacts = chooseContacts;
        vm.addManualy = addManualy;
        vm.skipToProfile = skipToProfile;

        $rootScope.$on('$stateChangeError', handleStateChangeError);

        function handleStateChangeError (event, toState, toParams, fromState, fromParams, error) {
            console.log('event -->', event);
            console.log('toState -->', toState);
            console.log('fromState -->', fromState);
            console.log('error -->', error);

            $state.go('signup-friends-contacts');
        }

        function chooseContacts () {
            $state.go('signup-friends-contacts', {resolveContacts: true});
        }

        function skipToProfile() {
            registerService.updateUser(registerService.userData)
                .then(function (response) {
                    if(response.success) {
                        $state.go('account.profile');
                    }
                }, function (err) {
                    $state.go('account.profile');
                });
        }

        function addManualy() {
            $state.go('signup-friends-contacts');
        }

    }
})();
