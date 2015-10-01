(function () {

    angular
        .module(AppConfig.appModuleName)
        .factory('cameraService', cameraService);

    cameraService.$inject = ['$q', '$ionicActionSheet'];

    function cameraService($q, $ionicActionSheet) {

        var source = {
            CAMERA: 1,
            PHOTOS: 0
        }



        return {
            showActionSheet: showActionSheet
        }
        
        //////////////////////////////////////////////////////////
        
        function getDefaults() {
            return {
                quality: 60,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: source,
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

        function getPicture(source, options) {
            var q = $q.defer();
            if (!navigator.camera) {
                console.log("******* Not a device. Using fake image *********");
                q.resolve(null);
                return q.promise;
            }

            options = _.defaults(options, getDefaults());

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
            var deferred = $q.defer();
            options = options || {};

            $ionicActionSheet.show({
                buttons: [
                    { text: 'Take a photo from camera' },
                    { text: 'Take a photo from album' }
                ],
                titleText: 'Choose your photo',
                cancelText: 'Cancel',
                cancel: function () {
                    deferred.reject({ error: false, status: 'cancelled', message: 'Action Sheet Cancelled' });
                },
                buttonClicked: function (index) {
                    switch (index) {
                        case 0:
                            console.log("Take a photo");
                            deferred.resolve(getPicture(source.CAMERA, options));
                            break;
                        case 1:
                            console.log("Take photo from album");
                            deferred.resolve(getPicture(source.PHOTOS, options));
                            break;
                    }
                    return true;
                }
            });
            return deferred.promise;
        }
    }
})();
