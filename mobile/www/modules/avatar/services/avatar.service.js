(function () {
    'use strict';

    angular
        .module('avatar')
        .factory('avatarService', avatarService);

    avatarService.$inject = ['modalService'];

    function avatarService(modalService) {
        var finalImage = null;
        var templateUrl, controller, params;

        return {
            getImage: getImage,
            setImage: setImage,
            showCropModal: showCropModal
        }
        
        function getImage() {
            return finalImage;
        }

        function setImage(data) {
            finalImage = data;
        }
        
        function showCropModal (parameters) {
            templateUrl = 'modules/avatar/templates/edit-avatar.html';
            controller = 'AvatarEditCtrl as vm';
            params = parameters || {};
            return modalService
                .show(templateUrl, controller, params)
        }
    }
})();