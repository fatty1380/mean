(function () {
    'use strict';

    angular.module('activity')
        .directive('tlineFeedItem', FeedItemDirective);

    FeedItemDirective.$inject = [];

    function FeedItemDirective () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'modules/account/child_modules/activity/templates/feed-item.mobile.template.html',
            controller: FeedItemCtrl,
            controllerAs: 'vm',
            bindToController: {
                entry: '=model'
            },
            link: link
        };

        function link (scope, el, attr, vm) {
            // debugger;

            vm.entry = scope.entry;

            if (_.isEmpty(vm.entry)) {
                return;
            }

            if (!!vm.entry.location) {
                vm.markers = {
                    color: 'red',
                    label: '',
                    coords: vm.entry.location.coordinates || []
                };
            }

            if (vm.entry._type === 'job') {
                vm.isJob = true;
                vm.username = vm.entry.title;
            }
            else if (!!vm.entry.company) {
                vm.avatar = vm.entry.company.profileImageURL;
                // vm.username = vm.entry.company.name;
                vm.title = vm.entry.title;
            }
            else if (!!vm.entry.user) {
                vm.activate();
            }
        }
    }

    FeedItemCtrl.$inject = ['activityService', 'activityModalsService', '$state', '$ionicPopup', 'LoadingService'];
    function FeedItemCtrl (activityService, activityModalsService, $state, $ionicPopup, LoadingService) {
        var vm = this;

        vm.stringify = function (obj) {
            return angular.toJson(obj, true);
        };

        vm.activate = activate;
        vm.likeActivity = likeActivity;
        vm.showActivityDetailsModal = showDetailsModal;
        vm.apply = apply;

        // ////////////////////////////////////////////////////////////////

        function activate () {
            vm.user = vm.entry.user || {};
            vm.avatar = activityService.getAvatar(vm.entry);
            vm.username = vm.user.handle || vm.user.displayName;
            vm.title = vm.entry.title;
        }

        /**
         * @param {Number} id - feed id
         */
        function likeActivity (id, event) {
            event.stopPropagation();

            activityService.likeActivity(id)
                .then(function (updatedLikes) {
                    LoadingService.showIcon('Liked!', 'ion-star');

                    if (_.isArray(updatedLikes)) {
                        vm.entry.likes = updatedLikes;
                    }
                }, function (err) {
                    logger.error('feed-item.directive.likeActivity Failed', err);
                });
        }

        function showDetailsModal (entry) {

            if (!!entry.company && entry.company.id && !$state.is('company')) {
                return $state.go('company', { companyId: entry.company.id });
            }

            activityModalsService
                .showActivityDetailsModal({ entry: entry })
                .then(function (res) {
                    logger.debug('Details Complete', res);
                }, function (err) {
                    logger.error(err, 'Failed to show Actiivty Details Modal');
                    activityService.showPopup('10-7', 'Please try later');
                });
        }

        function apply (entry) {
            var applyPopup = $ionicPopup.confirm({
                title: 'Send Application',
                template: 'This will send your profile to ' +
                    (entry.company.name || 'the employer') + ' for review. Continue?'
            });
            applyPopup.then(function (res) {
                if (res) {
                    LoadingService.showSuccess('Thanks for Applying');
                }
                else {
                    logger.debug('You are not sure');
                }
            });
        }
    }
})();
