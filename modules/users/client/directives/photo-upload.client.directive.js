(function () {
    'use strict';



    function PhotoModalDirective() {
        return {
            transclude: true,
            replace: true,
            templateUrl: 'modules/users/views/settings/picture-modal.client.template.html',
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

    // ------------------------------------------------------------------------------------------------------

    function PictureUploadDirective() {
        var ddo = {
            restrict: 'E',
            templateUrl: '/modules/users/views/settings/picture-upload.client.template.html',
            scope: {
                model: '=',
                title: '@',
                mode: '@?',
                apiUrl: '@?',
                successCallback: '&?',
                failCallback: '&?'
            },
            controller: 'PictureUploadController',
            controllerAs: 'vm',
            bindToController: true
        };

        return ddo;
    }

    function PictureUploadController($timeout, $window, FileUploader, $log) {
        var vm = this;

        vm.uploader = null;
        vm.uploadUrl = 'api/users/picture';
        vm.imageURL = vm.model.profileImageURL;

        vm.uploadProfilePicture = uploadProfilePicture;
        vm.cancelUpload = cancelUpload;

        function activate() {

            if (!vm.model) {
                $log.error('[PictureUploader] Must specify a model');
                vm.initialized = false;

                return;
            }

            if(!vm.mode && !vm.apiUrl) {
                vm.initialized = false;

                return;
            }

            if (!!vm.mode) {
                switch (vm.mode.toLowerCase()) {
                    case 'user': vm.uploadUrl = 'api/users/picture';
                        break;
                    case 'company': vm.uploadUrl = 'api/companies/' + vm.model._id + '/picture';
                        break;
                    default: $log.warn('[PictureUploader] Unknown Mode: %s', vm.mode);
                        vm.initialized = false;
                        return;
                }
            }
            else if (!!vm.apiUrl) {
                $log.debug('[PictureUploader] Mode not specified, using URL: %s', vm.apiUrl);
                vm.uploadUrl = vm.apiUrl;
            }

            vm.uploader = new FileUploader({
                url: vm.uploadUrl
            });

            // Set file uploader image filter
            vm.uploader.filters.push({
                name: 'imageFilter',
                fn: function (item, options) {
                    var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                    return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
                }
            });

            // Called after the user selected a new picture file
            vm.uploader.onAfterAddingFile = function (fileItem) {
                if ($window.FileReader) {
                    var fileReader = new FileReader();
                    fileReader.readAsDataURL(fileItem._file);

                    fileReader.onload = function (fileReaderEvent) {
                        $timeout(function () {
                            vm.imageURL = fileReaderEvent.target.result;
                        }, 0);
                    };
                }
            };

            // Called after the user has successfully uploaded a new picture
            // vm.uploader.onSuccessItem = !!vm.successCallback() ? vm.successCallback() :
            vm.uploader.onSuccessItem = function (fileItem, response, status, headers) {
                // Show success message
                vm.success = true;

                // Populate user object
                //vm.model = response; leave this to the successCallback?

                if(!!vm.successCallback()) {
                    vm.successCallback()(fileItem, response, status, headers);
                }

                // Clear upload buttons
                vm.cancelUpload();
            };

            // Called after the user has failed to uploaded a new picture
            vm.uploader.onErrorItem = function (fileItem, response, status, headers) {
                // Clear upload buttons
                vm.cancelUpload();

                // Show error message
                vm.error = response.message;
            };

            vm.initialized = true;
            $log.debug('[PictureUploader] Successfuly initialized Picture Uploader');
        }

        activate();

        // Method Implementations _________________________________________________________________


        // Change user profile picture
        function uploadProfilePicture() {
            // Clear messages
            vm.success = vm.error = null;

            // Start upload
            vm.uploader.uploadAll();
        }

        // Cancel the upload process
        function cancelUpload() {
            vm.uploader.clearQueue();
            vm.imageURL = vm.model.profileImageURL;
        }


    }

    PictureUploadController.$inject = ['$timeout', '$window', 'FileUploader', '$log'];

    angular.module('users') // TODO: Move to UTILS?
        .directive('osPhotoModal', PhotoModalDirective)
        .controller('PhotoModalController', PhotoModalController)
        .directive('osPictureUploader', PictureUploadDirective)
        .controller('PictureUploadController', PictureUploadController);

})();
