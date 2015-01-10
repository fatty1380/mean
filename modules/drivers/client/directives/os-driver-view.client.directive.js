(function() {
    'use strict';

    var simpleController = function(auth) {
        var vm = this;
        vm.auth = auth;

        vm.canEdit = function(user) {
            user = user || vm.driver.user;

            return vm.auth.user._id === user._id;
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
