(function () {
    'use strict';

    angular
        .module('account')
        .controller('AccountCtrl', AccountCtrl);

    AccountCtrl.$inject = ['$rootScope', '$state', 'lockboxSecurity', 'timerService', 'updateService', 'user'];

    function AccountCtrl ($rootScope, $state, lockboxSecurity, timerService, updateService, user) {
        var vm = this;
        logger.debug('AccountCtrl.init');

        vm.user = user;
        vm.userId = user && user.id;
        vm.updates = updateService.getLastUpdates();

        vm.lockboxOpen = false;

        vm.profileSelect = function () {
            $state.transitionTo('account.profile', {});
        };

        lockboxSecurity.getUnlockedStatus()
            .then(function (status) {
                vm.lockboxOpen = status;
            });

        $rootScope.$on('lockbox-unlocked', function (event) {
            vm.lockboxOpen = true;
        });

        $rootScope.$on('lockbox-secured', function (event) {
            vm.lockboxOpen = false;
        });

        $rootScope.$on('updates-available', function (event, updates) {
            logger.debug('AccountCtrl: New updates available: ', updates);
            vm.updates = updates;
        });

        // check for user updates (messages, activities, friend requests)
        updateService.checkForUpdates(user);
    }

})();
