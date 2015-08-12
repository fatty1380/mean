(function () {

    function cameraService( $q, $ionicActionSheet, modalService, userService, profileAvatarService) {

        var vm = this;
        vm.modal = modalService;
        vm.profileData = userService.profileData;

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
                            takePhoto(1);
                            break;
                        case 1:
                            console.log("Take photo from album");
                            takePhoto(0);
                            break;
                    }
                    return true;
                }
            });
        }

        function takePhoto(type) {
            getPicture(type)
            .then(function(imageData) {
                profileAvatarService.setImage(imageData);
            });
        }

        return {
            showActionSheet: showActionSheet
        }
    }

    cameraService.$inject = ['$q', '$ionicActionSheet', 'modalService', 'userService', 'profileAvatarService'];

    angular
        .module(AppConfig.appModuleName)
        .factory('cameraService', cameraService);
})();
