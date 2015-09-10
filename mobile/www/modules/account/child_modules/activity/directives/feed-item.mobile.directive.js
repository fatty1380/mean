(function () {
	'use strict';

	angular.module('activity')
		.directive('osetFeedItem', FeedItemDirective);

	FeedItemDirective.$inject = [];

	function FeedItemDirective() {
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

		function link(scope, el, attr, vm) {
			//debugger;

			vm.entry = scope.entry;

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
				vm.username = vm.entry.company.name;
				vm.title = vm.entry.title;
			} else if (!!vm.entry.user) {
				vm.username = vm.entry.user.handle || vm.entry.user.displayName;
				vm.avatar = 'modules/users/img/profile/default.png' != vm.entry.user.profileImageURL ? vm.entry.user.profileImageURL : vm.entry.user.props.avatar;
				vm.title = vm.entry.title;
			}
		}
	}

	FeedItemCtrl.$inject = ['activityService', 'activityModalsService', '$state', '$ionicPopup', '$ionicLoading'];
	function FeedItemCtrl(activityService, activityModalsService, $state, $ionicPopup, $ionicLoading) {
		var vm = this;

		vm.likeActivity = likeActivity;
		vm.showActivityDetailsModal = showDetailsModal;
		vm.apply = apply;

        /**
         * @param {Number} id - feed id
         */
        function likeActivity(id) {
            activityService.likeActivity(id).then(function (result) {
                //update like in feed
                for (var i = 0; i < vm.feed.length; i++) {
                    if (vm.feed[i].id === id) {
                        vm.feed[i].likes = result.data || [];
                        break;
                    }
                }
            }, function (resp) {
                console.log(resp);
            });
        }

		function showDetailsModal(entry) {
			if (!!entry.company && entry.company.id) {
				return $state.go('company', { companyId: entry.company.id });
			}
            //stopCheckNewActivities();
            activityModalsService
                .showActivityDetailsModal({ entry: entry })
                .then(function (res) {
                    //startCheckNewActivities();
                }, function (err) {
                    activityService.showPopup("Modal failed", "Please try later");
                })
        };



		function apply(entry) {
			var applyPopup = $ionicPopup.confirm({
				title: 'Send Application',
				template: 'This will send your profile to ' + (entry.company.name || 'the employer') + ' for review. Continue?'
			});
			applyPopup.then(function (res) {
				if (res) {
					$ionicLoading.show({
						template: '<i class="icon ion-checkmark"></i><br>Thanks for Applying',
						duration: 2000
					})
				} else {
					console.log('You are not sure');
				}
			});
		}
	}
})();