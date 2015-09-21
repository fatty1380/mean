(function () {
    'use strict';

    angular
        .module('account')
        .controller('AccountCtrl', AccountCtrl);

    AccountCtrl.$inject = ['updateService'];

    function AccountCtrl(updateService) {
        var vm = this;

        vm.updates = {
            messages: 3,
            activities: 15
        };

        vm.getLastUpdates = getLastUpdates;

        vm.getLastUpdates();

        function getLastUpdates () {
            updateService
                .getLastUpdates();
        }

    }

})();
