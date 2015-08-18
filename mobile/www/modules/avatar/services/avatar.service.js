(function () {
    'use strict';

    angular
        .module('avatar')
        .factory('avatarService', avatarService);

    avatarService.$inject = [];

    function avatarService() {
        var finalImage = null;

        function getImage() {
            return finalImage;
        }

        function setImage(data) {
            finalImage = data;
        }

        return {
            getImage: getImage,
            setImage: setImage
        }
    }
})();