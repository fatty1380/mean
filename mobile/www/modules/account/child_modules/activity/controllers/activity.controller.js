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
        vm.feedData = null;

        vm.showAddActivityModal = showAddActivityModal;
        vm.changeFeedSource = changeFeedSource;
        vm.updateWithNewActivities = updateWithNewActivities;
        vm.refresh = refresh;

        updateFeedData();

        function changeFeedSource() {
            activityService.changeFeedSource();
            updateFeedData();
            initialize();
        }

        function updateFeedData() {
            vm.feedData = activityService.getFeedData();
        }

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
            vm.feed = [];
            //show welcome screen for new user
            if (welcomeService.welcomeActivity) {
                activityModalsService
                    .showWelcomeModal()
                    .then(function () {
                        welcomeService.welcomeActivity = false;
                        initialize();
                    });
            } else {
                $ionicLoading.show({
                    template: vm.feedData.loadingText
                });
            }
                
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

        function startCheckNewActivities() {
            utilsService.startClock(function () {
                activityService.getFeedIds().then(function (feed) {
                    if (feed.length > vm.feed.length) {
                        vm.newActivities = feed.length - vm.feed.length;
                    } else {
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


        function showFeed() {
            console.log(' ');
            console.log('showFeed() ');
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
    }
})();
