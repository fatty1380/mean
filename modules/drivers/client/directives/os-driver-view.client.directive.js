(function() {
    'use strict';

    function OsDriverView() {
        return {
            priority: 0,
            templateUrl: '/modules/drivers/views/templates/driver-profile.client.template.html',
            replace: true,
            transclude: true,
            restrict: 'E',
            scope: {
                driver: '=model'
            },
            controller: function() {
                var vm = this;
            },
            controllerAs: 'vm',
            bindToController: true
        };
    }

    OsDriverView.$inject = [];

    angular
        .module('drivers')
        .directive('osDriverView', OsDriverView);
})();
