(function () {
    'use strict';

    angular
        .module('avatar')
        .factory('avatarModalsService', avatarModalsService);

    avatarModalsService.$inject = ['modalService'];

    function avatarModalsService (modalService) {
        var templateUrl, controller, params;

        function showEditModal (parameters) {
            templateUrl = 'modules/avatar/templates/edit-avatar.html';
            controller = 'AvatarEditCtrl as vm';
            params = parameters || {};

            return modalService
                .show(templateUrl, controller, params)
        }
        return {
            showEditModal: showEditModal
        };
    }
})();
