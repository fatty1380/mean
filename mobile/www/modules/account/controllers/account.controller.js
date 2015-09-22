(function () {
    'use strict';

    angular
        .module('account')
        .controller('AccountCtrl', AccountCtrl);

    AccountCtrl.$inject = ['$rootScope', 'updateService'];

    function AccountCtrl($rootScope, updateService) {
        var vm = this;

        vm.updates = {
            messages: 0,
            activities: 0
        };

        $rootScope.$on('updates-available', function (event, updates) {
            vm.updates = updates;
        });

        updateService.checkForUpdates(5);
    }

})();
