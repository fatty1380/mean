(function () {
    'use strict';

    angular
        .module('avatar')
        .controller('AvatarEditCtrl', AvatarEditCtrl);

    AvatarEditCtrl.$inject = ['parameters', 'userService', '$ionicLoading', 'avatarService', 'settings'];

    function AvatarEditCtrl(parameters, userService, $ionicLoading, avatarService, settings) {
        var vm = this;

        vm.profileData = userService.profileData;
        vm.rawImage = '';
        vm.croppedImage = '';

        vm.close = close;

        if (parameters.length) {
            vm.rawImage = 'data:image/jpeg;base64,' + parameters;
        } else {
            vm.rawImage = settings.defaultProfileImage;
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
                    console.error('Unable to save props', err);

                });
        }
    }
})();
