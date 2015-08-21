(function() {
    'use strict';

    angular
        .module('activity')
        .controller('ActivityCtrl', ActivityCtrl);

    ActivityCtrl.$inject = ['activityModalsService','activityService', '$ionicLoading'];

    function ActivityCtrl(activityModalsService, activityService, $ionicLoading) {
        var vm = this;
        vm.feed = [];

        initialize();

        function initialize() {
            vm.feed = [];
            $ionicLoading.show({
                template: 'loading feed'
            });
            //get all feed
            activityService.getFeed().then(function(result) {
                $ionicLoading.hide();
                console.log("getFeed() ",result);
                vm.feed = result;
            });
        }

        function updateSavedFeed(id) {
            $ionicLoading.show({
                template: 'update feed'
            });
            activityService.getFeedById(id).then(function(result) {
                var entry = {
                    user: result.user.displayName,
                    created: result.location[0].created,
                    message: result.message,
                    title: result.title,
                    comments: result.comments,
                    milesTraveled: '300 miles',
                    likes: ['some value', 'some value'],
                    location: {
                        type: result.location[0].type,
                        coordinates: result.location[0].coordinates
                    }
                };
                vm.feed.unshift(entry);
                $ionicLoading.hide();
            });
        }

        vm.showAddActivityModal = function () {
            activityModalsService
                .showAddActivityModal()
                .then(function (res) {
                    if(res){
                        updateSavedFeed(res);
                    }
                }, function (err) {
                    activityService.showPopup("Modal failed", "Please try later");
                })
        };

        vm.showActivityDetailsModal = function (entry) {
            activityModalsService
                .showActivityDetailsModal({entry: entry})
                .then(function (res) {
                }, function (err) {
                    activityService.showPopup("Modal failed", "Please try later");
                })
        };
    }
})();
