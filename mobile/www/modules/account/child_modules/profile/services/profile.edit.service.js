(function() {
    'use strict';

    function profileEditService(userService, modalService, $state, registerService, tokenService) {
        var vm = this;

        vm.modal = modalService;
        vm.profileData = userService.profileData;

        vm.logout = function () {
            registerService.signOut().then(function(data){
                tokenService.set('access_token', '');
                tokenService.set('refresh_token', '');
                tokenService.set('token_type', '');
                vm.modal.close();
                $state.go('signup/login');
            })
        }
    }

    profileEditService.$inject = ['userService', 'modalService', '$state', 'registerService', 'tokenService'];

    angular
        .module('profile')
        .service('profileEditService', profileEditService);

})();
