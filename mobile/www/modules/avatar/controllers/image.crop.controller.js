(function () {
    'use strict';

    angular
        .module('avatar')
        .controller('ImageCropCtrl', ImageCropController);

    ImageCropController.$inject = ['parameters', 'userService', '$ionicLoading', 'avatarService', 'settings'];

    function ImageCropController(parameters, userService, $ionicLoading, avatarService, settings) {
        var vm = this;

        vm.close = close;

        activate();
        
        ////////////////////////////////////////////////////////////////
        
        function activate() {
            vm.profileData = userService.profileData;
            vm.rawImage = '';
            vm.croppedImage = '';

            var inputImageType = parameters.inputImageType || 'image/jpeg';

            vm.imgSize = parameters.imgSize || 100;
            vm.areaType = parameters.areaType || 'circle';
            vm.imgType = parameters.imgType || 'image/jpeg';

            console.log('Initializng Image Cropper with size: ' + vm.imgSize + ', area: ' + vm.areaType + ', type: ' + vm.imgType)

            if (parameters.rawImage) {
                vm.rawImage = 'data:' + inputImageType + ';base64,' + parameters.rawImage;
            }
            else if (parameters.length && _.isString(parameters)) {
                vm.rawImage = 'data:' + inputImageType + ';base64,' + parameters;
            } else {
                vm.rawImage = settings.defaultProfileImage;
            }
        }

        function close(save) {
            if (!save) {
                return vm.closeModal();
            }
            $ionicLoading.show({
                template: '<ion-spinner></ion-spinner></br>Saving Changes'
            });

            avatarService.setImage(vm.croppedImage);
            var dataProps = {
                avatar: avatarService.getImage()
            };

            userService.updateUserProps(dataProps)
                .then(function success(profileDataProps) {
                    vm.profileData.props = profileDataProps;
                    vm.profileData.props.changed = true;
                    
                    // Only return the 'Avatar' property, since this is the 
                    // avatar edit controller.
                    vm.closeModal(profileDataProps.avatar);
                    $ionicLoading.hide();
                })
                .catch(function reject(err) {
                    console.error('Unable to save props', err, dataProps);

                });
        }
    }
})();
