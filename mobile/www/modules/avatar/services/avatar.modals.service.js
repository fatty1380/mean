(function () {
    'use strict';

    angular
        .module('avatar')
        .factory('avatarModalsService', avatarModalsService);

    avatarModalsService.$inject = ['modalService'];

    function avatarModalsService (modalService) {
        var templateUrl, controller;

        function showEditModal (parameters) {
            templateUrl = 'modules/avatar/templates/edit-avatar.html';
            controller = 'AvatarEditCtrl as vm';
            parameters = parameters || {};

            return modalService
                .show(templateUrl, controller, parameters)
        }
        return {
            showEditModal: showEditModal
        };
    }
})();
