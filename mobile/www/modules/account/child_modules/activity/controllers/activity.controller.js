(function () {
    'use strict';

    angular
        .module('activity')
        .controller('ActivityCtrl', ActivityCtrl);

    ActivityCtrl.$inject = ['$rootScope', 'updates', 'updateService', '$scope', '$state', '$cordovaGoogleAnalytics',
        'activityModalsService', 'activityService', 'LoadingService', 'user', 'settings', 'welcomeService'];

    function ActivityCtrl($rootScope, updates, updateService, $scope, $state, $cordovaGoogleAnalytics,
        activityModalsService, activityService, LoadingService, user, settings, welcomeService) {
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
            logger.debug('ActivityCtrl: %d New updates available: ', updates.activities);
            vm.updates = updates;
        });

        $scope.$on('$ionicView.enter', function () {
            updateService.resetUpdates('activities');

            if (vm.feed.length && activityService.changeFeedSource('activity')) {
                logger.debug('Activity Source Changed to ' + vm.feedData.feedSource);
                updateFeedData();
                initialize();
            }
            else if (!vm.feed.length) {
                updateFeedData();
                initialize();
            }
        });

        $rootScope.$on('clear', function () {
            $cordovaGoogleAnalytics.trackEvent('Activity', 'clear', null, vm.feed.length);
            logger.debug('ActivityCtrl clear');
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
            $cordovaGoogleAnalytics.trackEvent('Activity', 'add-friends');
            $state.go('account.profile.friends');
        }

        function updateFeedData() {
            vm.feedData = activityService.getFeedData();
        }

        function initialize() {
            vm.feed = [];

            $cordovaGoogleAnalytics.trackEvent('Activity', 'init', 'start');

            if (vm.feedData && welcomeService.isAckd($state.$current.name)) {
                LoadingService.showLoader(vm.feedData.loadingText);
            }

            //get all feed
            return activityService.getFeed()
                .then(function (result) {

                    vm.feed = _.uniq(result);
                    updateService.resetUpdates('activities');
                    logger.debug('getFeed() ', result);

                }, function () {
                    vm.feed = [];
                })
                .finally(function () {
                    LoadingService.hide();
                    $cordovaGoogleAnalytics.trackEvent('Activity', 'init', 'complete', vm.feed.length);
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
            $cordovaGoogleAnalytics.trackEvent('Activity', 'loadMore', 'start', vm.feed.length);
            if (vm.feed && vm.feed.length > 2) {
                logger.debug('[loadMore] Loading Updates');

                activityService.loadMore()
                    .then(function success(updates) {
                        logger.debug('[loadMore] got Updates: ' + updates);
                        angular.forEach(updates, function (val, key) {
                            logger.debug('[loadMore] Pushing item #' + key);
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
            $cordovaGoogleAnalytics.trackEvent('Activity', 'refreshFeedActivityById', id, vm.feed.length);
            LoadingService.showLoader('Updating Feed')

            activityService.getFeedActivityById(id).then(function (result) {
                logger.warn('get feed by id result --->>>', result);
                result.location = activityService.hasCoordinates(result) ? {
                    type: result.location.type || result.location.coordinates.length > 1 ? 'LineString' : 'Point',
                    coordinates: result.location.coordinates
                } : null;
                vm.feed.unshift(result);
                LoadingService.hide();
            });
        }

        function showAddActivityModal() {
            $cordovaGoogleAnalytics.trackEvent('Activity', 'addActivity', 'start');
            var then = Date.now();

            activityModalsService
                .showAddActivityModal({ user: user })
                .then(function (res) {
                    logger.debug(' res --->>>', res);
                    if (res) {
                        debugger;
                        if (angular.isObject(res)) {
                            logger.debug('Pushing newly created feed item onto the front of the array', res);
                            logger.debug(' vm.feed --->>>', vm.feed.length);
                            vm.feed.unshift(res);
                            logger.debug(' vm.feed --->>>', vm.feed);
                        }
                        else {
                            // TODO: Determine if the extra trip to the server is required
                            refreshFeedActivityById(res);
                        }
                    }

                    $cordovaGoogleAnalytics.trackTiming('Activity', Date.now() - then, 'addActivity', 'complete');
                })
                .catch(function (err) {
                    $cordovaGoogleAnalytics.trackTiming('Activity', Date.now() - then, 'addActivity', 'cancel');
                })
        }
    }
})();
