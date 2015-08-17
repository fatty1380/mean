(function() {
    'use strict';

    function profileRequestService(userService, modalService) {
        var vm = this;

        vm.modal = modalService;

        vm.profileData = userService.profileData;

    }

    profileRequestService.$inject = ['userService', 'modalService'];

    angular
        .module('profile')
        .service('profileRequestService', profileRequestService);

})();
