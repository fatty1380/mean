(function() {
    'use strict';

    function ActivityDetailsCtrl(activityDetailsService) {
        var vm = this;
        vm.entry = activityDetailsService.entry;
    }

    ActivityDetailsCtrl.$inject = ['activityDetailsService'];

    angular
        .module('activity')
        .controller('ActivityDetailsCtrl', ActivityDetailsCtrl);
})();
