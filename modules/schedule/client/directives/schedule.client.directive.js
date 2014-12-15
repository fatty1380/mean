(function() {
    'use strict';

    function ScheduleViewDirective() {
        return {
            templateUrl: 'modules/schedule/views/view-schedule.client.view.html',
            restrict: 'E',
            scope: {
                model: '=',
                title: '@?'
            },
            controller: 'ScheduleViewController',
            controllerAs: 'vm',
            bindToController: true
        };
    }

    angular
        .module('schedule')
        .directive('osViewSchedule', ScheduleViewDirective);

})();
