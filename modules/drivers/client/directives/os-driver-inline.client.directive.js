(function() {
    'use strict';

    function OsDriverInlineView() {
        return {
            priority: 0,
            templateUrl: '/modules/applications/views/templates/applicant-normal.client.template.html',
            replace: true,
            transclude: true,
            restrict: 'E',
            scope: {
                driver: '=model',
                profile: '=?',
                application: '=?'
            },
            controller: ['$q', 'Profiles', function($q, Profiles) {
                var vm = this;

                vm.profile = vm.profile || Profiles.getUserForDriver(vm.driver);
                vm.license = !!vm.driver.licenses && vm.driver.licenses.length ? vm.driver.licenses[0] : null;
            }],
            controllerAs: 'vm',
            bindToController: true
        };
    }



    OsDriverInlineView.$inject = [];

    angular
        .module('drivers')
        .directive('osDriverInline', OsDriverInlineView);
})();
