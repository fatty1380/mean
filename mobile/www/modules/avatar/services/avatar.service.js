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
            templateUrl = 'modules/avatar/templates/crop-image.html';
            controller = 'ImageCropCtrl as vm';
            params = parameters || {};
            return modalService
                .show(templateUrl, controller, params)
        }
    }
})();