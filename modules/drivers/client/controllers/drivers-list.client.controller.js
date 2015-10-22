(function () {
    'use strict';

    angular.module('drivers').controller('DriversListController', DriversListController);
    
    // Drivers controller
    DriversListController.$inject = ['$log', 'drivers'];
    function DriversListController($log, drivers) {
        var vm = this;

        vm.drivers = drivers;

        // Date Picker Ctrl

        vm.endorsementFilter = function (item) {
            return item.value === true;
        };

        vm.endorsementDisplay = function (item) {
            var i = item.key.indexOf('(');
            if (i > 0) {
                return item.key.substring(0, i).trim();
            }
            return item.key;
        };
    }
})();
