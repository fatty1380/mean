(function () {
    'use strict';

    angular
        .module('users')
        .controller('ProfileController', ProfileController);

    ProfileController.$inject = ['$state', '$log', 'user', 'profile', 'Companies'];
    function ProfileController($state, $log, user, profile, Companies) {
        if (!user) {
            $log.error('no user defined in profile instantiation');
            return $state.go('home');
        }

        var vm = this;

        vm.user = user;
        vm.profile = profile;
        
        if (!!vm.profile && !!vm.profile.company) {
            if (typeof vm.profile.company === 'string') {
                Companies.getByUser(vm.profile._id).then(
                    function (company) {
                        vm.company = company;
                    },
                    function (error) {
                        $log.error('Unable to get company for user due to `%s`', error);
                    }
                    );
            }
            else {
                vm.company = vm.profile.company;
            }
        }
    }

})();
