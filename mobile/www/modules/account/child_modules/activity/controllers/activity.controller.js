(function() {
    'use strict';

    angular
        .module('activity')
        .controller('ActivityCtrl', ActivityCtrl);

    ActivityCtrl.$inject = ['activityModalsService','activityService', '$ionicLoading'];

    function ActivityCtrl(activityModalsService, activityService, $ionicLoading) {
        var vm = this;
        vm.feed = [];
        var num = 0;
        var ids = [];
        
        // Initialize Update Logic
        vm.newActivities = 0;
        vm.lastUpdate = Date.now();

        $ionicLoading.show({
            template: 'loading feed'
        });

        activityService.feed().then(function(result) {
            ids = result;
            loadNextFeedItem(num);
        });

        function loadNextFeedItem(num) {
            activityService.getFeedById(ids[num]).then(function(result) {
                console.log(result);
                var entry = {
                    user: result.user.displayName,
                    created: result.location[0].created,
                    message: result.message,
                    title: result.title,
                    milesTraveled: '300 miles',
                    comments: result.comments,
                    likes: ['some value', 'some value','some value'],
                    location: {
                        type: result.location[0].type,
                        coordinates: result.location[0].coordinates
                    }
                };
                vm.feed.push(entry);

                if( num < ids.length - 1 ){
                    num++;
                    loadNextFeedItem(num);
                }else{
                    $ionicLoading.hide();
                }
            });
        }

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
