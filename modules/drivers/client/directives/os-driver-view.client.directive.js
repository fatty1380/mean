(function() {
    'use strict';

    var OsDriverViewController = function(Authentication) {
        var vm = this;
        vm.Authentication = Authentication;

        vm.canEdit = function(user) {
            user = user || vm.driver.user;
            console.log('User %s edits? %s v %s', user.firstName, vm.Authentication.user._id, user._id);

            return vm.Authentication.user._id === user._id;
        };

        vm.getDateRangeString = function(startDate, endDate) {
            var s,e;


            if(startDate && (s = moment(startDate))) {
                if (endDate && (e = moment(endDate))) {
                    return s.format('MMMM, YYYY') + ' - ' + e.format('MMMM, YYYY');
                }
                return s.format('MMMM, YYYY') + ' - present';
            }
            return null;
        };
    };

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
            controller: 'OsDriverViewController',
            controllerAs: 'vm',
            bindToController: true
        };
    }

    OsDriverViewController.$inject = ['Authentication'];

    angular
        .module('drivers')
        .controller('OsDriverViewController', OsDriverViewController)
        .directive('osDriverView', OsDriverView);
})();
