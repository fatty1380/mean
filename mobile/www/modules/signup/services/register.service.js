(function () {
    'use strict';

    angular
        .module('signup')
        .factory('registerService', registerService);
    
    registerService.$inject = ['$http', 'settings', 'API'];
    function registerService ($http, settings, API) {

        var data = {
            dataProps:{
                props: {
                }
            }
        }

        var service = {
            registerUser: registerUser,
            signIn: signIn,
            signOut: signOut,
            me: me,
            updateUser: updateUser,
            updateUserProps: updateUserProps,
            getProfiles: getProfiles,
            getProfileById: getProfileById,
            getDataProps: getDataProps,
            setDataProps: setDataProps,
            setProps: setProps
        };
        return service;

        function registerUser (data) {
            if (!data) return;
            return API.doRequest(settings.signup , 'post', data)
                .then(handleSuccess, handleError);
        }

        function updateUser (data) {
            if (!data) return;
            return API.doRequest(settings.users , 'put', data, true)
                .then(handleSuccess, handleError);
        }

        function updateUserProps (data) {
            if (!data) return;
            return API.doRequest(settings.usersProps, 'put', data, true)
                .then(handleSuccess, handleError);
        }

        function signIn (data) {
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
            return API.doRequest(settings.token, 'post', data )
                .then(handleSuccess, handleError);
        }

        function signOut() {
            return  API.doRequest(settings.signout , 'get' )
                .then(handleSuccess, handleError);
        }

        function me() {
            return  API.doRequest(settings.usersProfile, 'get' )
                .then(handleSuccess, handleError);
        }

        function getProfiles() {
            return  API.doRequest(settings.profiles , 'get' )
                .then(handleSuccess, handleError);
        }

        function getProfileById(profileId) {
            return  API.doRequest(settings.profiles + profileId , 'get' )
                .then(handleSuccess, handleError);
        }

        function getDataProps() {
            return data.dataProps;
        }

        function setDataProps(key, value) {
            data.dataProps[key] = value;
        }

        function setProps(key, value) {
            data.dataProps.props[key] = value;
        }

        function handleSuccess(response) {
            console.log('handleSuccess  ',response);
            return { success: true, message: response };
        }

        function handleError(response) {
            console.log('handleError  ',response);
            return { success: false, message: response, title: response.statusText  };
        }
    }
})();


