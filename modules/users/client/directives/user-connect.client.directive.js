(function() {
	'use strict';
	
	function ConnectionButtonDirective($log, Profiles) {
		
		var directive = {
			restrict: 'E',
			scope: {
				profile: '=',
				btnClass: '@?'
			},
			template: '<button type="button" ng-click="vm.click()" class="{{vm.class}}">XXX {{vm.buttonText}} XXX</button>',
			replace: false,
			link: linkFn,
			controller: ConnectionButtonController,
			controllerAs: 'vm',
			bindToController: true
			
		}
		
		return directive;
		
		function linkFn(scope, el, attr, ctrl) {
			var vm = scope.vm;
			
			vm.class = attr['class'];
			
			vm.click = function() {
				if(vm.isFriends) {
					alert('stop touching me!');
					return;
				}
				
						$log.info('Creating a new Friend Request!');
				
				Profiles.addFriend(vm.profile.id).then(
					function(success) {
						$log.info('Created friend request: %o', success);
						debugger;
					}
				)
			}
		}
	}
	
	function ConnectionButtonController($log, auth) {
		$log.error('ConnectionButtonController FTW!');
		var vm = this;
		
		var friendList = vm.profile.friends || [];
		
		$log.debug('profile has %d friends: %o', friendList.length, friendList);
		
		vm.isFriend = _.contains(friendList, auth.user.id);
		
		vm.buttonText = !!vm.isFriend ? 'FRIENDS' : 'Connect';
	}
	
	ConnectionButtonController.$inject = ['$log', 'Authentication'];
	ConnectionButtonDirective.$inject = ['$log', 'Profiles'];
	
	angular.module('users')
	.directive('osetConnectionButton', ConnectionButtonDirective );
})