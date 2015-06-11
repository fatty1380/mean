(function () {
	'use strict';

	function ConnectionButtonDirective($log, Friends) {

		var directive = {
			restrict: 'E',
			scope: {
				profile: '=',
				btnClass: '@?'
			},
			template: ['<button type="button" ng-hide="!!vm.button.hide" ',
				'ng-click="vm.click()" class="{{vm.class}}">',
				'<i ng-show="!!vm.button.icon" class="fa {{vm.button.icon}}"/>',
				'{{vm.button.text}}',
				'</button>'],
			replace: true,
			link: linkFn,
			controller: ConnectionButtonController,
			controllerAs: 'vm',
			bindToController: true
		};

		return directive;
		
		////////////////////////////////////
		
		var buttonConfig = {
			me: { hide: true },
			friends: { text: 'Friends', icon: 'fa-star' },
			sent: {text: 'friend request sent'},
			pending: { text: 'Accept Pending Request', icon: 'fa-check' },
			default: { text: 'Add Friend', icon: 'fa-plus' }
		};

		function linkFn(scope, el, attr, ctrl) {
			var vm = scope.vm;

			vm.class = attr['class'];
			vm.buttonConfig = buttonConfig;

			Friends.check(vm.profile).then(
				function (response) {
					$log.debug('Got Friend Check Response: %o', response);
					vm.status = response.status;
				},
				function (err) {
					$log.error(err, 'Unable to Check Friend Status');
					vm.status = 'default';
				});
		}
	}

	function ConnectionButtonController($log, Friends) {
		var vm = this;

		vm.click = click;
		
		////////////////////////////////////
		
		Object.setProperty(vm, 'button', {
			get: function () {
				return vm.buttonConfig[vm.status] || vm.buttonConfig['default'];
			}
		});

		function click() {
			debugger;
			if (vm.isFriends) {
				alert('stop touching me!');
				return;
			}

			$log.info('Creating a new Friend Request!');

			Friends.request(vm.profile.id).then(
				function (success) {
					$log.info('Created friend request: %o', success);
					vm.status = success.status;
				}
				)
				.catch(function (error) {
				$log.error({ error: error }, 'Unable to add Friend');
			});
		};
	}

	ConnectionButtonController.$inject = ['$log', 'Friends'];
	ConnectionButtonDirective.$inject = ['$log', 'Friends'];

	angular.module('users')
		.directive('osetConnectionButton', ConnectionButtonDirective);
})();