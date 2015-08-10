(function() {
    'use strict';

    function ActivityCtrl(modalService, activityService, activityDetailsService) {
        var vm = this;

        vm.feed = activityService.feed;

        vm.showModal = function (modalName, entry) {
            if(entry){
                activityDetailsService.entry = entry;
            }
            modalService.show(modalName);
        };

        vm.closeModal = function (modalName) {
            modalService.close(modalName);
        };
    }

    ActivityCtrl.$inject = ['modalService','activityService', 'activityDetailsService'];

    angular
        .module('activity')
        .controller('ActivityCtrl', ActivityCtrl);
})();
