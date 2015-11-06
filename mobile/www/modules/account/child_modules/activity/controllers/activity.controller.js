(function () {
    'use strict';

    angular
        .module('activity')
        .controller('ActivityCtrl', ActivityCtrl);

    ActivityCtrl.$inject = ['$rootScope', 'updates', 'updateService', '$scope', '$state', 'activityModalsService', 'activityService', '$ionicLoading', 'user', 'settings', 'welcomeService'];

    function ActivityCtrl($rootScope, updates, updateService, $scope, $state, activityModalsService, activityService, $ionicLoading, user, settings, welcomeService) {
        var vm = this;
        vm.feed = [];

        // Initialize Update Logic
        vm.lastUpdate = Date.now();
        vm.feedData = {};
        vm.updates = updates;

        vm.showAddActivityModal = showAddActivityModal;
        vm.changeFeedSource = changeFeedSource;
        vm.updateWithNewActivities = updateWithNewActivities;
        vm.refresh = refresh;
        vm.loadMore = loadMore;
        vm.addFriends = addFriends;
        vm.getFeedButtonClass = getFeedButtonClass;

        /**
         * try to initialize if have no feed
         * */

        $rootScope.$on('updates-available', function (event, updates) {
            console.log('ActivityCtrl: %d New updates available: ', updates.activities);
            vm.updates = updates;
        });

        $scope.$on('$ionicView.enter', function () {
            updateService.resetUpdates('activities');
            
            if (vm.feed.length && activityService.changeFeedSource('activity')) {
                console.log('Activity Source Changed to ' + vm.feedData.feedSource);
                updateFeedData();
                initialize();
            }
            else if (!vm.feed.length) {
                updateFeedData();
                initialize();
            }
        });

        $rootScope.$on('clear', function () {
            console.log('ActivityCtrl clear');
            vm.feed = [];
            vm.lastUpdate = Date.now();
        });

        function changeFeedSource() {
            activityService.changeFeedSource();
            updateFeedData();
            initialize();
        }

        function getFeedButtonClass() {
            return (/my/i.test(vm.feedData && vm.feedData.buttonName)) ? 'ion-chevron-up' : 'ion-chevron-down'
        }

        function addFriends() {
            $state.go('account.profile.friends');
        }

        function updateFeedData() {
            vm.feedData = activityService.getFeedData();
        }

        function initialize() {
            vm.feed = [];

            if (vm.feedData && welcomeService.isAckd($state.$current.name)) {
                $ionicLoading.show({
                    template: vm.feedData.loadingText
                });
            }

            //get all feed
            return activityService.getFeed()
                .then(function (result) {

                    vm.feed = _.uniq(result);
                    updateService.resetUpdates('activities');
                    console.log('getFeed() ', result);

                }, function () {
                    vm.feed = [];
                })
                .finally(function () {
                    $ionicLoading.hide();
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
                    });
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
                console.warn('get feed by id result --->>>', result);
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
                .showAddActivityModal({ user: user })
                .then(function (res) {
                    console.warn(' res --->>>', res);
                    if (res) {
                        debugger;
                        if (angular.isObject(res)) {
                            console.log('Pushing newly created feed item onto the front of the array', res);
                            console.warn(' vm.feed --->>>', vm.feed.length);
                            vm.feed.unshift(res);
                            console.warn(' vm.feed --->>>', vm.feed);
                        }
                        else {
                            // TODO: Determine if the extra trip to the server is required
                            refreshFeedActivityById(res);
                        }
                    }
                }, function (err) {
                    $ionicLoading.show({ template: '<h3>10-92</h3>Unable to checkin, try again later', duration: 2000 });
                })
        }
    }
})();
