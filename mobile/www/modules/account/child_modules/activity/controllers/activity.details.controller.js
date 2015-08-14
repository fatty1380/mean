(function() {
    'use strict';

    angular
        .module('activity')
        .controller('ActivityDetailsCtrl', ActivityDetailsCtrl);

    ActivityDetailsCtrl.$inject = ['activityDetailsService'];

    function ActivityDetailsCtrl(activityDetailsService) {
        var vm = this;
        vm.entry = activityDetailsService.entry;
    }
})();
