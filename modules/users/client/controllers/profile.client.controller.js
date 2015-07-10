(function() {
    'use strict';

    function ProfileController($state, $log, user, Companies, Drivers) {
        if(!user) {
            $log.error('no user defined in profile instantiation');
            return $state.go('home');
        }

        var vm = this;

        vm.user = user;

        if(!!vm.user) {
            if(!!vm.user.driver) {
                if(typeof vm.user.driver === 'string') {
                    Drivers.getByUser(vm.user._id).then(
                        function(driver) {
                            vm.driver = driver;
                        },
                        function(error) {
                            $log.error('Unable to get driver for user due to `%s`', error);
                        }
                    );
                }
                else {
                    vm.driver = vm.user.driver;
                }
            }
            if(!!vm.user.company) {
                if(typeof vm.user.company === 'string') {
                    Companies.getByUser(vm.user._id).then(
                        function(company) {
                            vm.company = company;
                        },
                        function(error) {
                            $log.error('Unable to get company for user due to `%s`', error);
                        }
                    );
                }
                else {
                    vm.company = vm.user.company;
                }
            }
        }
    }

    ProfileController.$inject = ['$state', '$log', 'user', 'Companies', 'Drivers'];

    angular
        .module('users')
        .controller('ProfileController', ProfileController);
})();
