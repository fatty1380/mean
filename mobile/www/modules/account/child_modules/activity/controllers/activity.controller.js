(function() {
    'use strict';

    angular
        .module('activity')
        .controller('ActivityCtrl', ActivityCtrl);

    ActivityCtrl.$inject = ['activityModalsService','activityService', '$ionicLoading'];

    function ActivityCtrl(activityModalsService, activityService, $ionicLoading) {
        var vm = this;

        $ionicLoading.show({
            template: 'loading feed'
        });

        activityService.feed().then(function(result) {
            $ionicLoading.hide();
            vm.feed = result;
            console.log(vm.feed);
        });

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
