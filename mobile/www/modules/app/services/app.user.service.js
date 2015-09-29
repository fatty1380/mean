(function () {
    'use strict';

    angular
        .module(AppConfig.appModuleName)
        .service('userService', userService);

    userService.$inject = ['registerService', '$q'];

    function userService(registerService, $q) {
        var vm = this;

        vm.profileData = {};
        
        vm.signOut = signOut;
        vm.getUserData = getUserData;
        vm.updateUserData = updateUserData;
        vm.getAvatar = getAvatar;
        vm.updateUserProps = updateUserProps;
        
        //////////////////////////////////////////////////////////////////////////
        
        function signOut() {
            return registerService.signOut().then(
                function (success) {
                    vm.profileData = {};
                }
            )
        };

        function getUserData() {
            if (!vm.profileData || !vm.profileData.id) {
                return registerService.me()
                    .then(function (profileData) {
                        vm.profileData = profileData.success ? profileData.message.data : null;
                        getAvatar(vm.profileData);
                        return vm.profileData;
                    });
            }
            return $q.when(vm.profileData);
        };

        function updateUserData(dataProps) {
            return registerService.updateUser(dataProps)
                .then(function (data) {
                    if(data.message.data.id){
                        vm.profileData = data.message.data;
                    }
                    return vm.profileData;
                });
            //return vm.profileData;
        };
        
        function getAvatar(userProfile) {
            if (!userProfile) { return null; }
            
            var avatar = userProfile.profileImageURL || userProfile.props && userProfile.props.avatar;

            if (!avatar || avatar === 'modules/users/img/profile/default.png'
                || !!~avatar.indexOf('/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4')) {
                return (userProfile.avatar = null);
            }

            userProfile.profileImageURL = userProfile.avatar = avatar;

            return avatar;
        }

        /**
         * Makes a request to the server to update the user's props array.
         * @dataProps object containing new or updated properties for the user
         */
        function updateUserProps(dataProps) {
            return registerService.updateUserProps(dataProps)
                .then(function (data) {
                    vm.profileData.props = data.message.data;
                    return vm.profileData.props;
                });
        }
    }
})();
