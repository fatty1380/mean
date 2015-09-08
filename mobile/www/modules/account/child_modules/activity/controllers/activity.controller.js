(function () {
    'use strict';

    angular
        .module('activity')
        .controller('ActivityCtrl', ActivityCtrl);

    ActivityCtrl.$inject = ['$scope', 'activityModalsService', 'activityService', '$ionicLoading', 'utilsService', 'settings', 'welcomeService'];

    function ActivityCtrl($scope, activityModalsService, activityService, $ionicLoading, utilsService, settings, welcomeService) {
        var vm = this;
        vm.feed = [];

        // Initialize Update Logic
        vm.newActivities = 0;
        vm.lastUpdate = Date.now();

        vm.showAddActivityModal = showAddActivityModal;
        vm.showActivityDetailsModal = showActivityDetailsModal;
        vm.updateWithNewActivities = updateWithNewActivities;
        vm.likeActivity = likeActivity;
        vm.refresh = refresh;

        /**
         * try to initialize if have no feed
         * */
        $scope.$on('$ionicView.enter', function () {
            if (vm.feed.length > 0) {
                startCheckNewActivities();
            } else {
                initialize();
            }
        });

        /**
         * turn off interval before leave view
        * */
        $scope.$on('$ionicView.beforeLeave', function () {
            stopCheckNewActivities();
        });

        function initialize() {
            //show welcome screen for new user
            if(welcomeService.welcomeActivity) {
                activityModalsService
                    .showWelcomeModal()
                    .then(function () {
                        welcomeService.welcomeActivity = false;
                        initialize();
                    });
            } else {
                vm.feed = [];
                $ionicLoading.show({
                    template: 'loading feed'
                });
                //get all feed
                return activityService.getFeed().then(function (result) {
                    $ionicLoading.hide();
                    console.log("getFeed() ", result);
                    vm.feed = result;
                    startCheckNewActivities();
                }, function () {
                    $ionicLoading.hide();
                    vm.feed = [];
                });
            }
        }

        /**
         * @param {Number} id - feed id
         */
        function likeActivity(id) {
            activityService.likeActivity(id).then(function(result) {
                //update like in feed
                for(var i = 0; i < vm.feed.length; i++) {
                    if(vm.feed[i].id === id) {
                        vm.feed[i].likes = result.data || [];
                        break;
                    }
                }
            },function(resp) {
                console.log(resp);
            });
        }

        function startCheckNewActivities() {
            utilsService.startClock(function() {
                activityService.getFeedIds().then(function(result) {
                    if(result.items.length > vm.feed.length){
                        vm.newActivities = result.items.length - vm.feed.length;
                    }else{
                        vm.newActivities = 0;
                    }
                }, function (resp) {
                });
            }, settings.activityTimeout);
        }

        function stopCheckNewActivities() {
            utilsService.stopClock();
        }

       /**
        *  @TODO update only new items
       */
        function updateWithNewActivities() {
            initialize();
        }

        function refresh() {
            initialize()
                .finally(function () {
                    // Stop the ion-refresher from spinning
                    $scope.$broadcast('scroll.refreshComplete');
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
            activityService.getFeedActivityById(id).then(function (result) {
                result.location = activityService.hasCoordinates(result) ? {
                    type: result.location.type || result.location.coordinates.length > 1 ? 'LineString' : 'Point',
                    coordinates: result.location.coordinates
                } : null;
                vm.feed.unshift(result);
                $ionicLoading.hide();
            });
        }

        function showAddActivityModal() {
            stopCheckNewActivities();
            activityModalsService
                .showAddActivityModal()
                .then(function (res) {
                    startCheckNewActivities();
                    if (res) {
                        // TODO: Determine if the extra trip to the server is required
                        refreshFeedActivityById(res);
                    }
                }, function (err) {
                    activityService.showPopup("Modal failed", "Please try later");
                })
        };

        function showActivityDetailsModal(entry) {
            stopCheckNewActivities();
            activityModalsService
                .showActivityDetailsModal({ entry: entry })
                .then(function (res) {
                    startCheckNewActivities();
                }, function (err) {
                    activityService.showPopup("Modal failed", "Please try later");
                })
        };

    }
})();
