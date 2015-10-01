(function () {
    'use strict';

    angular
        .module('signup')
        .factory('registerService', registerService);

    registerService.$inject = ['$http', 'settings', 'API'];
    function registerService($http, settings, API) {

        var _userData = {
            props: {}
        }

        /**
         * These 8 methods all make calls to the server
         * and return filtered promises (success=true|false}
         */
        var service = {
            registerUser: registerUser,
            signIn: signIn,
            signOut: signOut,
            me: me,
            updateUser: updateUser,
            updateUserProps: updateUserProps,
            getProfiles: getProfiles,
            getProfileById: getProfileById,
            reset: function reset() { _userData = { props: {} }; }
        };
        
        /**
         * the following object properties make the current user
         * (while being registerd), available to the varous controllers.
         * 
         */
        Object.defineProperty(service, 'userProps',
            {
                isEnumerable: true,
                get: function () {
                    return _userData.props;
                }
            });
        
        Object.defineProperty(service, 'userData',
            {
                isEnumerable: true,
                get: function () {
                    return _userData;
                }
            });
        
        return service;
        
        ////////////////////////////////////////////////////////////////

        function registerUser(data) {
            if (!data) return;
            return API.doRequest(settings.signup, 'post', data)
                .then(handleSuccess, handleError);
        }

        function updateUser(data) {
            if (!data) return;
            return API.doRequest(settings.users, 'put', data, true)
                .then(handleSuccess, handleError);
        }

        function updateUserProps(data) {
            if (!data) return;
            return API.doRequest(settings.usersProps, 'put', data, true)
                .then(handleSuccess, handleError);
        }

        function signIn(data) {
            if (!data) return;

            var signinData = {
                grant_type: 'password',
                client_id: 'mobile_v0_1',
                client_secret: 'shenanigans'
            };

            data.username = data.email;
            data.grant_type = signinData.grant_type;
            data.client_id = signinData.client_id;
            data.client_secret = signinData.client_secret;
            return API.doRequest(settings.token, 'post', data)
                .then(handleSuccess, handleError);
        }

        function signOut() {
            return API.doRequest(settings.signout, 'get')
                .then(handleSuccess, handleError);
        }

        function me() {
            return API.doRequest(settings.usersProfile, 'get')
                .then(handleSuccess, handleError);
        }

        function getProfiles() {
            return API.doRequest(settings.profiles, 'get')
                .then(handleSuccess, handleError);
        }

        function getProfileById(profileId) {
            return API.doRequest(settings.profiles + profileId, 'get')
                .then(handleSuccess, handleError);
        }
        
        ////////////////////////////////////////////////////////////////

        function handleSuccess(response) {
            console.log('handleSuccess ', response);
            return { success: true, message: response };
        }

        function handleError(response) {
            console.error('handleError: ', response);
            return { success: false, message: response, title: response.statusText };
        }
    }
})();


