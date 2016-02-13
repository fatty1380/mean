(function () {
    'use strict';

    angular
        .module('account')
        .controller('AccountCtrl', AccountCtrl);

    AccountCtrl.$inject = ['$rootScope', '$state', 'updateService', 'timerService', 'user'];

    function AccountCtrl ($rootScope, $state, updateService, timerService, user) {
        var vm = this;
        logger.debug('AccountCtrl.init');

        vm.user = user;
        vm.userId = user && user.id;
        vm.updates = updateService.getLastUpdates();

        vm.profileSelect = function () {
            $state.transitionTo('account.profile', {});
        };

        $rootScope.$on('updates-available', function (event, updates) {
            logger.debug('AccountCtrl: New updates available: ', updates);
            vm.updates = updates;
        });

        // check for user updates (messages, activities, friend requests)
        updateService.checkForUpdates(user);
    }

})();
