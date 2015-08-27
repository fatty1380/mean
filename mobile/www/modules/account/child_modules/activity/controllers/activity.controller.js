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

        vm.showAddActivityModal = showAddActivityModal;
        vm.showActivityDetailsModal = showActivityDetailsModal;

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

        /**
         * @desc update feed item
         * @param {Number} id - feed id
         */
        function refreshFeedActivityById(id) {
            $ionicLoading.show({
                template: 'update feed'
            });
            activityService.getFeedActivityById(id).then(function(result) {

                result.location = activityService.hasCoordinates(result) ? {
                    type: result.location.type || result.location.coordinates.length > 1 ? 'LineString' : 'Point',
                    coordinates: result.location.coordinates
                } : null;
                
                // var entry = {
                //     user: result.user.displayName,
                //     created: result.created,
                //     message: result.message,
                //     title: result.title,
                //     comments: result.comments,
                //     milesTraveled: '300 miles',
                //     likes: ['some value', 'some value'],
                //     location: loc
                // };
                // vm.feed.unshift(entry);
                
                vm.feed.unshift(result);
                
                $ionicLoading.hide();
            });
        }

        function showAddActivityModal() {
            activityModalsService
                .showAddActivityModal()
                .then(function (res) {
                    if (res) {
                        // TODO: Determine if the extra trip to the server is required
                        refreshFeedActivityById(res);
                    }
                }, function (err) {
                    activityService.showPopup("Modal failed", "Please try later");
                })
        };

        function showActivityDetailsModal(entry) {
            activityModalsService
                .showActivityDetailsModal({entry: entry})
                .then(function (res) {
                }, function (err) {
                    activityService.showPopup("Modal failed", "Please try later");
                })
        };
    }
})();
