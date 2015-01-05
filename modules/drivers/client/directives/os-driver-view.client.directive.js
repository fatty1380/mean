(function() {
    'use strict';

    var simpleController = function(auth) {
        var vm = this;
        vm.auth = auth;

        vm.canEdit = function(user) {
            user = user || vm.driver.user;

            return vm.auth.user._id === user._id;
        };
    };

    simpleController.$inject = ['Authentication'];

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
            controller: simpleController,
            controllerAs: 'vm',
            bindToController: true
        };
    }

    OsDriverView.$inject = [];

    angular
        .module('drivers')
        .directive('osDriverView', OsDriverView);
})();
