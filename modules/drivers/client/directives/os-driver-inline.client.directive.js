(function() {
    'use strict';

    function OsDriverInlineView() {
        return {
            priority: 0,
            templateUrl: '/modules/drivers/views/templates/driver-inline.client.template.html',
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

    OsDriverInlineView.$inject = [];

    angular
        .module('drivers')
        .directive('osDriverInline', OsDriverInlineView);
})();
