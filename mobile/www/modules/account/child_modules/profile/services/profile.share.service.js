(function() {
    'use strict';

    function profileShareService(userService, modalService, lockboxDocuments) {
        var vm = this;

        vm.lockboxDocuments = lockboxDocuments;
        vm.modal = modalService;
        vm.profileData = userService.profileData;
        vm.shareStep = 1;

        vm.close = function () {
            var self = this;
            modalService
                .close()
                .then(function () {
                    self.shareStep = 1;
                }
            );
        }

    }

    profileShareService.$inject = ['userService', 'modalService', 'lockboxDocuments'];

    angular
        .module('profile')
        .service('profileShareService', profileShareService);

})();
