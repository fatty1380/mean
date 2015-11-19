(function () {

    angular
        .module(AppConfig.appModuleName)
        .factory('cameraService', cameraService);

    cameraService.$inject = ['$q', '$ionicActionSheet'];

    function cameraService($q, $ionicActionSheet) {
        
        return {
            showActionSheet: showActionSheet
        }
        
        //////////////////////////////////////////////////////////
        
        function getDefaults() {
            return {
                quality: 60,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.CAMERA,
                allowEdit: false,
                encodingType: Camera.EncodingType.JPEG,
                targetWidth: 512,
                targetHeight: 1024,
                correctOrientation: true,
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: false,
                mediaType: 0
            };
        }

        function getPicture(photoSource, options) {
            var q = $q.defer();
            if (!navigator.camera) {
                logger.warn("******* Not a device. Using fake image *********");
                q.resolve(null);
                return q.promise;
            }

            options = _.defaults({ sourceType: photoSource }, options, getDefaults());

            navigator.camera.getPicture(onSuccess, onFail, options);

            function onSuccess(getPictureResult) {
                q.resolve(getPictureResult);
            }

            function onFail(getPictureError) {
                q.reject(getPictureError);
            }

            return q.promise;
        }

        function showActionSheet(options) {
            options = options || {};

            if (_.isObject(options.sourceType)) {
                return getPicture(options.sourceType, options)
            }

            var deferred = $q.defer();
            $ionicActionSheet.show({
                buttons: [
                    { text: 'Take a photo from camera' },
                    { text: 'Take a photo from album' }
                ],
                titleText: 'Choose your photo',
                cancelText: 'Cancel',
                cancel: function () {
                    deferred.reject({ error: false, message: 'Camera Action Sheet Cancelled' });
                },
                buttonClicked: function (index) {
                    switch (index) {
                        case 0:
                            logger.debug("Take a photo");
                            deferred.resolve(getPicture(1, options)); // Camera.PictureSourceType.CAMERA
                            break;
                        case 1:
                            logger.debug("Take photo from album");
                            deferred.resolve(getPicture(0, options)); // Camera.PictureSourceType.PHOTOLIBRARY
                            break;
                    }
                    return true;
                }
            });

            return deferred.promise;
        }
    }
})();
