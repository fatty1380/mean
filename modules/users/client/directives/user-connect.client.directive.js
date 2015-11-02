(function () {
	'use strict';


	angular.module('users')
		.directive('osetConnectionButton', ConnectionButtonDirective);

	ConnectionButtonDirective.$inject = ['$log', 'Friends', 'Authentication'];
	function ConnectionButtonDirective($log, Friends, Authentication) {

		var directive = {
			restrict: 'E',
			scope: {
				profile: '=',
				btnClass: '@?'
			},
			template: [
				'<button type="button" ng-hide="!!vm.button.hide" ',
				'uib - tooltip="{{vm.request | prettyPrint}}"',
				'ng-click="vm.click()" ng-class="pull-right {{vm.class}}">',
				'{{vm.button.text}}',
				'<i ng-show="!!vm.button.icon" class="fa {{vm.button.icon}}"></i>',
				'</button>'].join(' '),
			replace: true,
			link: linkFn,
			controller: ConnectionButtonController,
			controllerAs: 'vm',
			bindToController: true
		};
		
		// TODO: Expand functionality to include 'ignore' via split button
		var altTemplate = [
			'<button type="button" ng-if="!!vm.request" ng-hide="!!vm.button.hide || !vm.request || vm.status === \'sent\'"',
			'ng-click="vm.click(true)" ng-class="{{vm.class}}">',
			'ignore',
			'</button>'
		];

		return directive;
		
		////////////////////////////////////

		function linkFn(scope, el, attr, ctrl) {
			var vm = scope.vm;

			vm.class = attr['class'] || 'btn btn-oset-secondary';
			vm.status = 'default';
			vm.buttonConfig = {
				me: { hide: true },
				none: { text: 'ignored' },
				friends: { text: 'Friends', icon: 'fa-star' },
				sent: { text: 'Request Sent' },
				pending: { text: 'Accept Pending Request', icon: 'fa-question' },
				noauth: { hide: true },
				default: { text: 'Add Friend', icon: 'fa-plus' }
			};

			Object.defineProperty(vm, 'button', {
				get: function () {
					return !vm.buttonConfig ? { hide: true } : vm.buttonConfig[vm.status] || vm.buttonConfig['default'] || { hide: true };
				}
			});
			
			if (Authentication.isLoggedIn()) {
				Friends.check(vm.profile).then(
					function (response) {
						$log.debug('Got Friend Check Response: %o', response);
						vm.setStatus(response);
					},
					function (err) {
						$log.error(err, 'Unable to Check Friend Status');
						vm.status = 'default';
						vm.request = null;
					});
			} else {
				vm.button.hide = true;
			}
		}
	}

	ConnectionButtonController.$inject = ['$log', 'Friends', 'Authentication'];
	function ConnectionButtonController($log, Friends, Authentication) {
		var vm = this;

		vm.auth = Authentication;
		vm.click = click;
		vm.setStatus = setStatus;

		function setStatus(request) {
			vm.request = request;

			if (!vm.auth.isLoggedIn()) {
				return (vm.status = 'noauth');
			}

			if (vm.auth.isLoggedIn() && vm.auth.user.id === vm.profile.id) {
				return (vm.status = 'me');
			}

			if (!!request) {
				if (request.status === 'accepted') {
					return (vm.status = 'friends');
				}

				if (request.status === 'new') {
					var fromId = !!request.from && request.from.id || request.from;
					vm.status = vm.auth.user.id === fromId ? 'sent' : 'pending';
					return;
				}
			}



			vm.status = 'default';
		}

		function click(reject) {
			if (vm.status === 'pending') {
				var action = !!reject ? Friends.reject(vm.request) : Friends.accept(vm.request);

				return action.then(function (result) {
					if (result.status === 'accepted') {
						vm.status = 'friends';
					} else if (result.status === 'rejected') {
						vm.status = 'none';
					} else {
						vm.setStatus(result);
					}
				})
					.catch(function (err) {
						$log.error(err, 'unable to %s the friend request', !!reject ? 'reject' : 'accept');
					});
			}

			if (vm.status === 'default' || !vm.status) {
				$log.info('Creating a new Friend Request!');

				Friends.request(vm.profile.id).then(
					function (success) {
						debugger;
						$log.info('Created friend request: %o', success);
						vm.status = success.status;

						switch (success.status) {
							case 'new': return (vm.status = 'sent');
							case 'accepted': return (vm.status = 'friends');
						}
					})
					.catch(function (error) {
						$log.error({ error: error }, 'Unable to add Friend');
					});
			}

			return false;
		}
	}
})();