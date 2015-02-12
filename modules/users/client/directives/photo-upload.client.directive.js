(function () {
    'use strict';



    function PhotoModalDirective() {
        return {
            transclude: true,
            replace: true,
            templateUrl: '/modules/users/views/settings/picture-modal.client.template.html',
            restrict: 'EA',
            scope: {
                title: '@?'
            },
            controller: 'PhotoModalController'
        };
    }

    function PhotoModalController($scope, $modal, $log) {

        $scope.isOpen = false;

        $scope.show = function() {
            var modalInstance = $modal.open({
                templateUrl: 'uploadPictureModal.html',
                controller: function() {
                    debugger;
                }
            });

            modalInstance.result.then(function(result) {
                $log.info('Modal result %o', result);
                $scope.isOpen = false;
            }, function(result) {
                $log.info('Modal dismissed at: ' + new Date());
                $scope.isOpen = false;
            });

            modalInstance.opened.then(function(args) {
                $scope.isOpen = true;
            });

        };
    }

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
                failCallback: '&?'
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
        .directive('osPhotoModal', PhotoModalDirective)
        .controller('PhotoModalController', PhotoModalController)
        .directive('osPictureUploader', PictureUploadDirective)
        .directive('osetFileUpload', FileUploadDirective);
        //.controller('PictureUploadController', PictureUploadController);

})();
