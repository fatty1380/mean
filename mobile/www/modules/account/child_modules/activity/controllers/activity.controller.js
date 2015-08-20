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

        initialize();

        function initialize() {
            num = 0;
            ids = [];
            vm.feed = [];
            $ionicLoading.show({
                template: 'loading feed'
            });
            //get all feed ids
            activityService.feed().then(function(result) {
                ids = result;
                loadItems(num);
            });
        }

        function loadItems(num) {
            activityService.getFeedById(ids[num]).then(function(result) {
                var entry = {
                    user: result.user.displayName,
                    created: result.location[0].created,
                    message: result.message,
                    title: result.title,
                    milesTraveled: '300 miles',//hardcoded
                    comments: result.comments,
                    likes: ['some value', 'some value','some value'],//hardcoded
                    location: {
                        type: result.location[0].type,
                        coordinates: result.location[0].coordinates
                    }
                };
                vm.feed.unshift(entry);
                if( num < ids.length - 1 ){
                    num++;
                    loadItems(num);
                }else{
                    $ionicLoading.hide();
                }
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
                    milesTraveled: '300 miles',
                    comments: result.comments,
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
                    console.log(res);
                    if(res){
                        console.log('update feed!');
                        updateSavedFeed(res);
                    }
                }, function (err) {
                    console.log(err);
                    console.log('error!!');
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
