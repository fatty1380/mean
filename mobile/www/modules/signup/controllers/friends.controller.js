(function () {
    'use strict';

    angular
        .module('signup')
        .controller('SignupFriendsCtrl', SignupFriendsCtrl);

    SignupFriendsCtrl.$inject = ['$state', '$rootScope', '$cordovaGoogleAnalytics', '$ionicHistory', 'registerService'];

    function SignupFriendsCtrl ($state, $rootScope, $cordovaGoogleAnalytics, $ionicHistory, registerService) {
        var vm = this;

        vm.chooseContacts = chooseContacts;
        vm.addManually = addManually;
        vm.skipToProfile = skipToProfile;
        vm.goBack = goBack;

        $rootScope.$on('$stateChangeError', handleStateChangeError);

        function handleStateChangeError (event, toState, toParams, fromState, fromParams, error) {
            logger.error('Friends Controller: Handle State Change Error', error);
            logger.debug('event -->', event);
            logger.debug('toState -->', toState);
            logger.debug('fromState -->', fromState);
            logger.debug('error -->', error);

            if (fromState && fromState.name === 'signup.friends') {
                $state.go('signup.friends-contacts');
            }
        }

        function chooseContacts () {
            $cordovaGoogleAnalytics.trackEvent('signup', 'friends', 'chooseContacts');
            $state.go('signup.friends-contacts', { resolveContacts: true });
        }

        function skipToProfile () {
            $cordovaGoogleAnalytics.trackEvent('signup', 'friends', 'skip');
            // No changes within the friends controller - no saving required
            // single responsibility pattern ftw!
            $state.go('account.profile');
        }

        function addManually () {
            $cordovaGoogleAnalytics.trackEvent('signup', 'friends', 'addManually');
            $state.go('signup.friends-manually');
        }

        function goBack () {
            var backView = $ionicHistory.backView();

            if (_.isEmpty(backView) || _.isEmpty(backView.stateName)) {
                return $state.go('signup.trailers');
            }

            return $ionicHistory.goBack();
        }

    }
})();
