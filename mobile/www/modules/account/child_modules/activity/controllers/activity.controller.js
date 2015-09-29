(function () {
    'use strict';

    angular
        .module('activity')
        .controller('ActivityCtrl', ActivityCtrl);

    ActivityCtrl.$inject = ['$rootScope', 'updates', 'updateService', '$scope', '$state', 'activityModalsService', 'activityService', '$ionicLoading', 'utilsService', 'settings', 'welcomeService'];

    function ActivityCtrl($rootScope, updates, updateService, $scope, $state, activityModalsService, activityService, $ionicLoading, utilsService, settings, welcomeService) {
        var vm = this;
        vm.feed = [];

        // Initialize Update Logic
        vm.lastUpdate = Date.now();
        vm.feedData = null;
        vm.updates = updates;

        vm.showAddActivityModal = showAddActivityModal;
        vm.changeFeedSource = changeFeedSource;
        vm.updateWithNewActivities = updateWithNewActivities;
        vm.refresh = refresh;
        vm.loadMore = loadMore;
        vm.addFriends = addFriends;

        /**
         * try to initialize if have no feed
         * */

        $rootScope.$on('updates-available', function (event, updates) {
            vm.updates = updates;
        });

        $scope.$on('$ionicView.enter', function () {
            updateService.resetUpdates('activities');

            if (!vm.feed.length) {
                updateFeedData();
                initialize();
            }
        });

        $rootScope.$on("clear", function () {
            console.log('ActivityCtrl clear');
            vm.feed = [];
            vm.lastUpdate = Date.now();
        });

        function changeFeedSource() {
            activityService.changeFeedSource();
            updateFeedData();
            initialize();
        }

        function addFriends() {
            $state.go('account.profile.friends');
        }

        function updateFeedData() {
            vm.feedData = activityService.getFeedData();
        }

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
                console.log(vm.feedData);
                if (vm.feedData) {
                    $ionicLoading.show({
                        template: vm.feedData.loadingText
                    });
                }
            }

            //get all feed
            return activityService.getFeed().then(function (result) {
                $ionicLoading.hide();

                vm.feed = result;
                updateService.resetUpdates('activities');
                console.log("getFeed() ", result);

            }, function () {
                $ionicLoading.hide();
                vm.feed = [];
            });
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

        function loadMore() {

            if (vm.feed && vm.feed.length > 2) {
                console.log('[loadMore] Loading Updates');

                activityService.loadMore()
                    .then(function success(updates) {
                        console.log('[loadMore] got Updates: ' + updates);
                        angular.forEach(updates, function (val, key) {
                            console.log('[loadMore] Pushing item #' + key);
                            vm.feed.push(val);
                        })
                    })
                    .finally(function () {
                        // Stop the ion-refresher from spinning
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    });;
            } else {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
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
            activityModalsService
                .showAddActivityModal()
                .then(function (res) {
                    if (res) {
                        debugger;

                        if (angular.isObject(res)) {
                            console.log('Pushing newly created feed item onto the front of the array', res);
                            vm.feed.unshift(res);
                            $scope.$apply();
                        }
                        else {
                            // TODO: Determine if the extra trip to the server is required
                            refreshFeedActivityById(res);
                        }
                    }
                }, function (err) {
                    activityService.showPopup("Modal failed", "Please try later");
                })
        }
    }
})();
