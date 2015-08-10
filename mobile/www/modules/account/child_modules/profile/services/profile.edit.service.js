(function() {
    'use strict';

    function profileEditService(userService, modalService) {
        var vm = this;

        vm.modal = modalService;

        vm.profileData = userService.profileData;

        vm.close = function () {

        }

    }

    profileEditService.$inject = ['userService', 'modalService'];

    angular
        .module('profile')
        .service('profileEditService', profileEditService);

})();
