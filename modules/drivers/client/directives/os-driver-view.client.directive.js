(function() {
    'use strict';

    var simpleController = function(Authentication) {
        var vm = this;
        vm.Authentication = Authentication;

        vm.canEdit = function(user) {
            user = user || vm.driver.user;
            console.log('User %s edits? %s v %s', user.firstName, vm.Authentication.user._id, user._id);

            return vm.Authentication.user._id === user._id;
        };

        vm.getExperienceString = function(experience) {
            var retval = '<strong>' + experience.title + '</strong>';

            retval += ' ' + vm.getDateRange(experience.time);

            return retval;
        };

        vm.getDateRange = function(time) {
            var s,e;

            if(time.start && (s = moment(time.start))) {
                if (time.end && (e = moment(time.end))) {
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

    simpleController.$inject = ['Authentication'];

    angular
        .module('drivers')
        .controller('OsDriverViewController', simpleController)
        .directive('osDriverView', OsDriverView);
})();
