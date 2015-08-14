(function() {
    'use strict';

    angular
        .module('activity')
        .controller('ActivityCtrl', ActivityCtrl);

    ActivityCtrl.$inject = ['activityModalsService','activityService'];

    function ActivityCtrl(activityModalsService, activityService) {
        var vm = this;

        vm.feed = activityService.feed;

        vm.showAddActivityModal = function () {
            activityModalsService
                .showAddActivityModal()
                .then(function (res) {
                    console.log(res);
                }, function (err) {
                    console.log(err);
                })
        };

        vm.showActivityDetailsModal = function (entry) {
            activityModalsService
                .showActivityDetailsModal({entry: entry})
                .then(function (res) {
                    console.log(res);
                }, function (err) {
                    console.log(err);
                })
        };

    }

})();
