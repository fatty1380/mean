(function () {
    'use strict';

    function ProfilePictureController($timeout, $window, FileUploader, $log) {
        var vm = this;

        vm.uploader = null;
        vm.uploadUrl = 'api/users/picture';
        vm.imageURL = vm.model.profileImageURL;

        vm.newImage = null;
        vm.croppedImage = null;

        vm.isCropping = false;
        vm.useCropped = false;

        vm.saveCrop = saveCrop;

        vm.uploadProfilePicture = uploadProfilePicture;
        vm.cancelUpload = cancelUpload;

        function activate() {
            if (!vm.model) {
                $log.error('[PictureUploader] Must specify a model');
                vm.initialized = false;

                return;
            }

            if (!vm.mode && !vm.apiUrl) {
                vm.initialized = false;

                return;
            }

            if (!!vm.mode) {
                switch (vm.mode.toLowerCase()) {
                    case 'user':
                        vm.uploadUrl = 'api/users/picture';
                        break;
                    case 'company':
                        vm.uploadUrl = 'api/companies/' + vm.model._id + '/picture';
                        break;
                    default:
                        $log.warn('[PictureUploader] Unknown Mode: %s. Defaulting to user', vm.mode);
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

            /**
             * Upload Blob (cropped image) instead of file.
             * @see
             *   https://developer.mozilla.org/en-US/docs/Web/API/FormData
             *   https://github.com/nervgh/angular-file-upload/issues/208
             */
            vm.uploader.onBeforeUploadItem = function (item) {

                var blob = dataURItoBlob(vm.useCropped ? vm.croppedImage : vm.newImage);
                item._file = blob;
            };

            // Called after the user selected a new picture file
            vm.uploader.onAfterAddingFile = function (fileItem) {
                if ($window.FileReader) {
                    var fileReader = new FileReader();
                    fileReader.readAsDataURL(fileItem._file);
                    vm.success=vm.error=null;

                    fileReader.onload = function (fileReaderEvent) {
                        $timeout(function () {
                            //vm.imageURL = fileReaderEvent.target.result;
                            vm.newImage = fileReaderEvent.target.result;
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
                vm.model = response;

                if (!!vm.successCallback()) {
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

        function saveCrop() {
            vm.useCropped = true;
            vm.isCropping = false;
        }

        /**
         * Converts data uri to Blob. Necessary for uploading.
         * @see
         *   http://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata
         * @param  {String} dataURI
         * @return {Blob}
         */
        var dataURItoBlob = function (dataURI) {
            var binary = atob(dataURI.split(',')[1]);
            var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
            var array = [];
            for (var i = 0; i < binary.length; i++) {
                array.push(binary.charCodeAt(i));
            }
            return new Blob([new Uint8Array(array)], {type: mimeString});
        };

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

            vm.newImage = null;
            vm.croppedImage = null;
            vm.isCropping = false;
            vm.useCropped = false;

            vm.imageURL = vm.model.profileImageURL;
        }


    }

    ProfilePictureController.$inject = ['$timeout', '$window', 'FileUploader', '$log'];


    angular.module('users')
        .controller('ChangeProfilePictureController', ProfilePictureController);
})();
