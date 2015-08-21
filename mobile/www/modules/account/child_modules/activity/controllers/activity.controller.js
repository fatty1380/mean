(function() {
    'use strict';

    angular
        .module('activity')
        .controller('ActivityCtrl', ActivityCtrl);

    ActivityCtrl.$inject = ['activityModalsService','activityService', '$ionicLoading'];

    function ActivityCtrl(activityModalsService, activityService, $ionicLoading) {
        var vm = this;
        vm.feed = [];

        // Initialize Update Logic
        vm.newActivities = 0;
        vm.lastUpdate = Date.now();

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
            }, function(reason) {
                $ionicLoading.hide();
                vm.feed = [];
            });
        }

        function updateSavedFeed(id) {
            $ionicLoading.show({
                template: 'update feed'
            });
            activityService.getFeedById(id).then(function(result) {

                var loc = !!result.location[0] ? {
                    type: result.location[0].type,
                    coordinates: result.location[0].coordinates
                } : null;
                
                var entry = {
                    user: result.user.displayName,
                    created: result.created,
                    message: result.message,
                    title: result.title,
                    comments: result.comments,
                    milesTraveled: '300 miles',
                    likes: ['some value', 'some value'],
                    location: loc
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
