(function () {
    'use strict';

    angular
        .module('account')
        .controller('AccountCtrl', AccountCtrl);

    AccountCtrl.$inject = ['$rootScope', 'updateService', 'user'];

    function AccountCtrl($rootScope, updateService, user) {
        var vm = this;

        vm.updates = updateService.getLastUpdates();

        $rootScope.$on('updates-available', function (event, updates) {
            vm.updates = updates;
        });

        updateService.checkForUpdates(5, user);
    }

})();
