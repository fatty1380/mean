(function () {

    angular
        .module(AppConfig.appModuleName)
        .factory('cameraService', cameraService);

    cameraService.$inject = ['$q', '$ionicActionSheet', 'avatarModalsService'];

    function cameraService($q, $ionicActionSheet, avatarModalsService) {

        var source = {
            CAMERA: 1,
            PHOTOS: 0
        }

        return {
            showActionSheet: showActionSheet
        }


        function getPicture(type) {

            var q = $q.defer();
            if (!navigator.camera) {
                console.log("******* Not a device. Using fake image *********");
                q.resolve(null);
                return q.promise;
            }

            var options = {
                quality: 80,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: type,
                allowEdit: false,
                encodingType: Camera.EncodingType.JPEG,
                targetWidth: 500,
                targetHeight: 1000,
                correctOrientation: true,
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: false
            };

            navigator.camera.getPicture(options)
                .then(function success(getPictureResult) {
                    q.resolve(getPictureResult);
                })
                .catch(function reject(getPictureError) {
                    console.error('camera.getPicture] Error', getPictureError);
                    q.reject(getPictureError);
                });

            return q.promise;
        }

        function showActionSheet() {
            
            var deferred = $q.defer();
            
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
                            deferred.resolve(takePhoto(source.CAMERA));
                            break;
                        case 1:
                            console.log("Take photo from album");
                            deferred.resolve(takePhoto(source.PHOTOS));
                            break;
                    }
                    return true;
                }
            });
            
            return deferred.promise;
        }

        function takePhoto(type) {
            return getPicture(type)
                .then(function success(imageData) {
                    return avatarModalsService.showEditModal(imageData);
                })
                .then(function avatarModalSuccess(response) {
                    debugger;

                    return response;
                });;
        }
    }
})();
