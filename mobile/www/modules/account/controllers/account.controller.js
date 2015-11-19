(function () {
    'use strict';

    angular
        .module('account')
        .controller('AccountCtrl', AccountCtrl);

    AccountCtrl.$inject = ['$rootScope', 'updateService', 'timerService', 'user'];

    function AccountCtrl($rootScope, updateService, timerService, user) {
        var vm = this;
        logger.debug('AccountCtrl.init');
            
        vm.updates = updateService.getLastUpdates();

        $rootScope.$on('updates-available', function (event, updates) {
            logger.debug('AccountCtrl: New updates available: ', updates);
            vm.updates = updates;
        });

        //check for user updates (messages, activities, friend requests)
        updateService.checkForUpdates(user);
    }

})();
