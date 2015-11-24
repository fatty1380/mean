(function () {
    'use strict';

    angular
        .module(AppConfig.appModuleName)
        .service('userService', userService);

    userService.$inject = ['registerService', '$q', '$cordovaGoogleAnalytics'];

    function userService(registerService, $q, $cordovaGoogleAnalytics) {
        var vm = this;

        vm.profileData = {};
        
        vm.signOut = signOut;
        vm.getUserData = getUserData;
        vm.updateUserData = updateUserData;
        vm.getAvatar = getAvatar;
        vm.updateUserProps = updateUserProps;
        
        Object.defineProperty(vm, 'userId', {
            enumerable: true,
            get: function () {
                return _.isEmpty(vm.profileData) ? null : vm.profileData.id;
            }
        });
        
        //////////////////////////////////////////////////////////////////////////
        
        function signOut() {
            return registerService.signOut().then(
                function (response) {
                    if(response.success) {vm.profileData = {};
                        $cordovaGoogleAnalytics.setUserId();
                    }
                }
            )
        }
        
        function getUserData() {
            if (!vm.profileData || !vm.profileData.id) {
                return registerService.me()
                    .then(function (response) {
                        if(response.success){
                            vm.profileData = response.message.data;
                            getAvatar(vm.profileData);
                            $cordovaGoogleAnalytics.setUserId(vm.profileData.id);
                        
                            return vm.profileData;
                        }
                        return null;
                    });
            }
            return $q.when(vm.profileData);
        }

        /**
         * Makes a request to the server to update the user object.
         * @dataProps object containing new or updated properties for the user
         * @note This should not be used for the 'props' object. See `updateUserProps`
         */
        function updateUserData(dataProps) {
            return registerService.updateUser(dataProps)
                .then(function (data) {
                    if(data.success && data.message.data.id){
                        _.extend(vm.profileData, data.message.data);
                    }
                    return vm.profileData;
                });
        }

        /**
         * Makes a request to the server to update the user's props object.
         * @dataProps object containing new or updated properties for the user
         */
        function updateUserProps(dataProps) {
            return registerService.updateUserProps(dataProps)
                .then(function (data) {
                    if (data.success) {
                        vm.profileData.props = vm.profileData.props || {};
                        _.extend(vm.profileData.props, data.message.data)
                        return vm.profileData.props;
                    }
                    else {
                        return null;
                    }
                });
        }
        
        function getAvatar(userProfile) {
            
            if (!userProfile || _.isString(userProfile)) { return null; }
            
            var avatar = filterAvatar(userProfile.profileImageURL) || filterAvatar(userProfile.props && userProfile.props.avatar);

            userProfile.profileImageURL = userProfile.avatar = avatar;

            return avatar;
        }
        
        function filterAvatar(input) {
            
            if (!input || input === 'modules/users/img/profile/default.png'
                || /4AAQSkZJRgABAQAAAQABAAD\/2wBDAAoHBwgHBgoICAgLCgoLDhg/.test(input)) {
                return null;
            }
            
            return input;
        }
    }
})();
