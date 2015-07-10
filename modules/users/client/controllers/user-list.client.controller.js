(function () {
	'use strict';
	
	function UserListController (Auth, Profiles, $log, users) {
                    var vm = this;
                    vm.users = users;

                    vm.myId = Auth.user.id;

                    vm.queryIndex = -1;

                    vm.doSearch = function () {

                        var index = ++vm.queryIndex;

                        var terms = vm.searchTerms.split(' ');
                        $log.debug('Searching for `%s`', terms);

                        Profiles.query({ 'text': terms }).then(function (results) {
                            $log.debug('Query %d of %d', index, vm.queryIndex);

                            if (index < vm.queryIndex) {
                                $log.error('Ignoring stale query result: %d', index);
                                return false;
                            }

                            $log.debug('Got %d results', results.length);
                            vm.filter = _.pluck(results, 'id');
                            vm.queryIndex = index;
                        });

                    };

                    vm.doFilter = function (value, index) {
                        return _.isEmpty(vm.searchTerms) || _.contains(vm.filter, value.id);
                    };
	}
				
	UserListController.$inject = ['Authentication', 'Profiles', '$log', 'users']
 
 angular.module('users').controller('UserListController', UserListController)
	
 })();