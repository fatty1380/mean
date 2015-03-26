(function () {
    'use strict';

    function PictureUploadDirective() {
        var ddo = {
            restrict: 'E',
            templateUrl: '/modules/users/views/settings/picture-upload.client.template.html',
            scope: {
                model: '=',
                title: '@',
                mode: '@?',
                shape: '@?',
                apiUrl: '@?',
                successCallback: '&?',
                failCallback: '&?',
                allowBlank: '=?',
                isEditing: '=?'
            },
            controller: 'ChangeProfilePictureController',
            controllerAs: 'vm',
            bindToController: true
        };

        return ddo;
    }

    function FileUploadDirective() {
        var ddo = {
            restrict: 'E',
            templateUrl: '/modules/users/views/settings/file-upload.client.template.html',
            scope: {
                model: '=',
                title: '@',
                mode: '@?',
                apiUrl: '@?',
                successCallback: '&?',
                failCallback: '&?',
                allowBlank: '=?',
                modelId: '=',
                uploadBtnClass: '@?',
                uploadBtnText: '@?',
                autoUpload: '=?',
                hideIcon: '=?'
            },
            controller: 'ChangeProfilePictureController',
            controllerAs: 'vm',
            bindToController: true
        };

        return ddo;
    }

    angular.module('users') // TODO: Move to UTILS?
        .directive('osPictureUploader', PictureUploadDirective)
        .directive('osetFileUpload', FileUploadDirective);
        //.controller('PictureUploadController', PictureUploadController);

})();
