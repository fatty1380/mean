(function () {
    'use strict';

    function ProfilePictureController($timeout, $window, FileUploader, $log, $attrs, $scope) {
        var vm = this;

        vm.initializeVariables = function() {
            vm.autoUpload = !!vm.autoUpload;
            vm.autoCrop = !!vm.autoCrop;
            vm.isEditing = false;

            vm.uploader = null;
            vm.uploadUrl = 'api/users/picture';

            vm.newImage = null;
            vm.croppedImage = null;

            vm.isCropping = false;
            vm.useCropped = false;

            vm.saveCrop = saveCrop;

            vm.shape = vm.shape || 'circle';

            vm.hasFile = !!vm.modelPath ? !!(vm.model[vm.modelPath]) : !!vm.model;

            if(!!vm.modelPath && vm.hasFile) {
                vm.uploadBtnText = 'Select New File ...';
            }
        };

        vm.initializeVariables();
        vm.uploadProfilePicture = uploadProfilePicture;
        vm.cancelUpload = cancelUpload;

        var pictureFilter = {
            name: 'imageFilter',
            fn: function (item, options) {
                var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
            }
        };

        var resumeFilter = {
            name: 'resumeFilter',
            fn: function (item, options) {
                var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                return '|pdf|docx|doc|rtf|'.indexOf(type) !== -1;
            }
        };

        function activate() {
            if(vm.allowBlank && !vm.model) {
                $log.debug('[ChangeProfilePictureCtrl] Initialized blank model');
                vm.model = {};
            }

            if (!vm.allowBlank && !vm.model) {
                $log.error('[PictureUploader] Must specify a model');
                vm.initialized = false;

                return;
            }

            if (!vm.mode && !vm.apiUrl) {
                vm.initialized = false;

                return;
            }

            vm.initializeUploader();

            /**
             * Upload Blob (cropped image) instead of file.
             * @see the following links:
             *   https://developer.mozilla.org/en-US/docs/Web/API/FormData
             *   https://github.com/nervgh/angular-file-upload/issues/208
             */
            vm.uploader.onBeforeUploadItem = function (item) {
                var blob;
                if (vm.hasOwnProperty('imageURL')) {
                    blob = dataURItoBlob(vm.useCropped ? vm.croppedImage : vm.newImage, vm.useCropped ? vm.newImage : null);
                } else {
                    blob = dataURItoBlob(vm.newFile);
                }
                item._file = blob;
            };

            // Called after the user selected a new picture file
            vm.uploader.onAfterAddingFile = function (fileItem) {
                if ($window.FileReader) {
                    var fileReader = new FileReader();
                    fileReader.readAsDataURL(fileItem._file);
                    vm.success = vm.error = null;

                    vm.isEditing = true;

                    vm.fileName = fileItem.file.name;

                    fileReader.onload = function (fileReaderEvent) {
                        $timeout(function () {
                            //vm.imageURL = fileReaderEvent.target.result;
                            debugger;
                            if (vm.hasOwnProperty('imageURL')) {
                                vm.newImage = fileReaderEvent.target.result;
                            } else {
                                vm.newFile = fileReaderEvent.target.result;
                            }
                            if(vm.autoUpload) {
                                vm.uploadProfilePicture();
                            }

                            if(vm.autoCrop) {
                                vm.isCropping = true;
                            }

                        }, 0);
                    };
                }
            };

            // Called after the user has successfully uploaded a new picture
            // vm.uploader.onSuccessItem = !!vm.successCallback() ? vm.successCallback() :
            vm.uploader.onSuccessItem = function (fileItem, response, status, headers) {

                // Populate model object
                if(!!vm.modelPath) {
                    vm.model[vm.modelPath] = response;
                }
                else {
                    vm.model = response;
                }

                if (angular.isDefined($attrs.successCallback)) {
                    vm.successCallback()(fileItem, response, status, headers);
                } else {
                    debugger;
                }

                // Clear upload buttons
                vm.cancelUpload();
                // Show success message
                vm.success = true;

                //$timeout(function () {
                //    vm.reactivateUploader();
                //}, 0);
            };

            // Called after the user has failed to uploaded a new picture
            vm.uploader.onErrorItem = function (fileItem, response, status, headers) {
                // Clear upload buttons
                vm.cancelUpload();

                if (angular.isDefined($attrs.failCallback)) {
                    vm.failCallback()(fileItem, response, status, headers);
                }

                // Show error message
                vm.error = response.message;
            };

            $scope.$watch(function() {
                if(vm.mode.toLowerCase()==='resume') {
                    return vm.modelId;
                }
                return vm.model;
            }, function(newVal, oldVal) {
                vm.updateUploadUrl();
            });

            vm.initialized = true;
            $log.debug('[PictureUploader] Successfuly initialized Picture Uploader');
        }

        vm.resetVariables = function() {

            var filter;

            switch (vm.mode.toLowerCase()) {
                case 'user':
                    vm.imageURL = vm.model.profileImageURL;
                    vm.uploadUrl = 'api/users/picture';
                    // vm.modelPath = 'profileImageURL';
                    filter = pictureFilter;
                    break;

                case 'company':
                    vm.imageURL = vm.model.profileImageURL;
                    vm.uploadUrl = 'api/companies/' + vm.model._id + '/picture';
                    // vm.modelPath = 'profileImageURL';
                    filter = pictureFilter;
                    break;

                case 'resume':
                    vm.uploadUrl = 'api/drivers/' + (vm.modelId || vm.model._id) + '/resume';
                    vm.modelPath = vm.modelPath || 'resume';
                    filter = resumeFilter;
                    break;

                case 'documents':
                    vm.uploadUrl = 'api/drivers/' + vm.modelId + '/documents';
                    vm.modelPath = vm.modelPath || 'file';
                    filter = resumeFilter;
                    break;

                case 'raw':
                    vm.uploadUrl = null;
                    debugger; // TODO: Determine how to upload w/out user
                    filter = pictureFilter;
                    break;

                default:
                    $log.warn('[FileUploader] Unknown Mode: %s. Defaulting to user', vm.mode);
            }

            return filter;
        };

        vm.updateUploadUrl = function() {
            if(!vm.uploader) {
                return false;
            }

            vm.resetVariables();

            if(vm.uploader.url !== vm.uploadUrl) {
                debugger;
                vm.uploader.url = vm.uploadUrl;
            }
        };

        vm.initializeUploader = function() {
            var filter;

            if (!!vm.mode) {
                filter = vm.resetVariables();
            }
            else if (!!vm.apiUrl) {
                $log.debug('[PictureUploader] Mode not specified, using URL: %s', vm.apiUrl);
                vm.uploadUrl = vm.apiUrl;
            }

            vm.uploader = new FileUploader({
                url: vm.uploadUrl
            });

            // Set file uploader image filter
            $log.debug('initailzing uploader with filter: ', !!filter && filter.name);
            vm.uploader.filters.push(filter);
        };

        vm.reactivateUploader = function() {
            $timeout(function () {
                vm.uploader.destroy();
                vm.initializeVariables();
                activate();
            }, 0);
        };

        activate();

        // Method Implementations _________________________________________________________________


        vm.startCrop = function () {
            if(!vm.uploader || !vm.uploader.queue.length){
                vm.newImage = vm.imageURL;
            }
            vm.isCropping = true;
        };

        vm.cancelCrop = function() {
            vm.isCropping = false;

            if(vm.autoCrop) {
                vm.uploadProfilePicture();
            }
        };

        function saveCrop() {
            vm.useCropped = true;

            if(vm.autoCrop) {
                vm.uploadProfilePicture();
            } else {
                vm.isCropping = false;
            }
        }

        /**
         * Converts data uri to Blob. Necessary for uploading.
         * @see
         *   http://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata
         * @param  {String} dataURI
         * @return {Blob}
         */
        function dataURItoBlob(dataURI) {
            // convert base64/URLEncoded data component to raw binary data held in a string
            var byteString;
            if (dataURI.split(',')[0].indexOf('base64') >= 0) {
                byteString = atob(dataURI.split(',')[1]);
            }
            else {
                byteString = unescape(dataURI.split(',')[1]);
            }

            // separate out the mime component
            var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

            // write the bytes of the string to a typed array
            var ia = new Uint8Array(byteString.length);
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }

            return new Blob([ia], { type: mimeString });
        }

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

            if(!!vm.model) {
                vm.imageURL = vm.model.profileImageURL;
            }
            vm.success = vm.error = null;
            vm.isCropping = false;
            vm.isEditing = false;

            delete vm.newImage;
            delete vm.croppedImage;
            delete vm.newFile;
        }


    }

    ProfilePictureController.$inject = ['$timeout', '$window', 'FileUploader', '$log', '$attrs', '$scope'];


    angular.module('users')
        .controller('ChangeProfilePictureController', ProfilePictureController);
})();
