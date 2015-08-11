(function () {
    'use strict';

    var userService  = function (registerService) {
        var vm = this;

        vm.profileData = {};

        vm.getUserData = function () {
            if(!vm.profileData.id){
                return registerService.me()
                    .then(function (profileData) {
                        vm.profileData = profileData.message.data;
                        return vm.profileData;
                    });
            }
            return vm.profileData;
        }

    };

    userService.$inject = ['registerService'];

    angular
        .module(AppConfig.appModuleName)
        .service('userService', userService);
})();
