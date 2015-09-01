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
            if(!navigator.camera){
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
                correctOrientation:true,
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: false
            };

            navigator.camera.getPicture(function(result) {
                q.resolve(result);
            }, function(err) {
                q.reject(err);
            }, options);
            return q.promise;
        }

        function showActionSheet() {
            $ionicActionSheet.show({
                buttons: [
                    { text: 'Take a photo from camera' },
                    { text: 'Take a photo from album' }
                ],
                titleText: 'Choose your photo',
                cancelText: 'Cancel',
                cancel: function() {
                },
                buttonClicked: function(index) {
                    switch (index){
                        case 0:
                            console.log("Take a photo");
                            takePhoto(source.CAMERA);
                            break;
                        case 1:
                            console.log("Take photo from album");
                            takePhoto(source.PHOTOS);
                            break;
                    }
                    return true;
                }
            });
        }

        function takePhoto(type) {
            getPicture(type)
            .then(function(imageData) {
                 avatarModalsService.showEditModal(imageData);
            });
        }
    }
})();
