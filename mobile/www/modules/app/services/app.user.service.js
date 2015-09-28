(function () {
    'use strict';

    angular
        .module(AppConfig.appModuleName)
        .service('userService', userService);

    userService.$inject = ['registerService', '$q'];

    function userService(registerService, $q) {
        var vm = this;

        vm.profileData = {};
        
        vm.signOut = function () {
            return registerService.signOut().then(
                function (success) {
                    vm.profileData = {};
                }
            )
        };

        vm.getUserData = function () {
            if (!vm.profileData || !vm.profileData.id) {
                return registerService.me()
                    .then(function (profileData) {
                        vm.profileData = profileData.success ? profileData.message.data : null;
                        return vm.profileData;
                    });
            }
            return $q.when(vm.profileData);
        };

        vm.updateUserData = function (dataProps) {
            return registerService.updateUser(dataProps)
                .then(function (data) {
                    if(data.message.data.id){
                        vm.profileData = data.message.data;
                    }
                    return vm.profileData;
                });
            //return vm.profileData;
        };
        
        vm.getAvatar = function getAvatar(friend) {
            var avatar = friend.profileImageURL || friend.props && friend.props.avatar;

            if (!avatar || avatar === 'modules/users/img/profile/default.png'
                || !!~avatar.indexOf('/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4')) {
                return (friend.avatar = null);
            }

            friend.avatar = avatar;

            return avatar;
        }

        /**
         * Makes a request to the server to update the user's props array.
         * @dataProps object containing new or updated properties for the user
         */
        vm.updateUserProps = function (dataProps) {
            return registerService.updateUserProps(dataProps)
                .then(function (data) {
                    vm.profileData.props = data.message.data;
                    return vm.profileData.props;
                });
        }
    }
})();
