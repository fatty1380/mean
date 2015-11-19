(function () {
    'use strict';

    angular
        .module('avatar')
        .factory('avatarService', avatarService);

    avatarService.$inject = ['modalService', 'cameraService'];

    function avatarService(modalService, cameraService) {
        var finalImage = null;
        var templateUrl, controller, params;

        return {
            getImage: getImage,
            setImage: setImage,
            getNewAvatar: getNewAvatar,
            showCropModal: showCropModal
        }

        function getImage() {
            return finalImage;
        }

        function setImage(data) {
            finalImage = data;
        }
        
        /**
         * getNewAvatar
         */
        function getNewAvatar(parameters, profile) {
            cameraService.showActionSheet({ cameraDirection: 1 })
                .then(
                    function success(rawImageResponse) {
                        return showCropModal({ rawImage: rawImageResponse, imgSize: 512 });
                    })
                .then(
                    function success(newImageResponse) {
                        profile.profileImageURL = profile.props.avatar = newImageResponse || finalImage;
                    })
                .catch(
                    function reject(rejection) {
                        if (rejection.error || _.isUndefined(rejection.error)) {
                            logger.error('getNewAvatar Failed due to error', rejection)
                        } else {
                            logger.debug('getNewAvatar Aborted %s', rejection.message || rejection)
                        }
                    });
        }

        function showCropModal(parameters) {
            templateUrl = 'modules/avatar/templates/crop-image.html';
            controller = 'ImageCropCtrl as vm';
            params = parameters || {};
            
            return modalService
                .show(templateUrl, controller, params)
        }
    }
})();
