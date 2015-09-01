(function () {
    'use strict';

    angular
        .module(AppConfig.appModuleName)
        .service('userService', userService);

    userService.$inject = ['registerService', '$q'];

    function userService(registerService, $q) {
        var vm = this;

        vm.profileData = {};
        
        vm.signOut = function () {
            return registerService.signOut().then(
                function (success) {
                    vm.profileData = {};
                }
            )
        }

        vm.getUserData = function () {
            if (!vm.profileData || !vm.profileData.id) {
                return registerService.me()
                    .then(function (profileData) {
                        vm.profileData = profileData.success ? profileData.message.data : null;
                        return vm.profileData;
                    });
            }
            return $q.when(vm.profileData);
        }

        vm.updateUserData = function (dataProps) {
            return registerService.updateUser(dataProps)
                .then(function (data) {
                    vm.profileData = data.message.data;
                    return vm.profileData;
                });
            //return vm.profileData;
        };

        /**
         * Makes a request to the server to update the user's props array.
         * @dataProps object containing new or updated properties for the user
         */
        vm.updateUserProps = function (dataProps) {
            return registerService.updateUserProps(dataProps)
                .then(function (data) {
                    vm.profileData.props = data.message.data;
                    return vm.profileData.props;
                });
        }

    };
})();
