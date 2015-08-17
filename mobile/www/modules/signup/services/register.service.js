(function () {
    'use strict';

    angular
        .module('signup')
        .factory('registerService', registerService);

    registerService.$inject = ['$http', 'settings'];

    function registerService ($http, settings) {

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
            getProfilesID: getProfilesID,
            getDataProps: getDataProps,
            setDataProps: setDataProps,
            setProps: setProps
        };
        return service;

        function registerUser (data) {
            if (!data) return;
            return requestApi(settings.signup , "post", data)
                .then(handleSuccess, handleError);
        }

        function updateUser (data) {
            if (!data) return;
            return requestApi(settings.users , "put", data, true)
                .then(handleSuccess, handleError);
        }

        function updateUserProps (data) {
            if (!data) return;
            return requestApi(settings.usersProps, "put", data, true)
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
            return requestApi(settings.token, "post", data )
                .then(handleSuccess, handleError);
        }

        function signOut() {
            return  requestApi(settings.signout , "get" )
                .then(handleSuccess, handleError);
        }

        function me() {
            return  requestApi(settings.usersProfile, "get" )
                .then(handleSuccess, handleError);
        }

        function getProfiles() {
            return  requestApi(settings.profiles , "get" )
                .then(handleSuccess, handleError);
        }

        function getProfilesID(profileId) {
            return  requestApi(settings.profiles + profileId , "get" )
                .then(handleSuccess, handleError);
        }

        function requestApi(apiUrl, method, data, needSerialize) {
            $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded;charset=utf-8";
            return $http ({
                url: apiUrl,
                method: method,
                data: !needSerialize ? serializeData(data) : data
            })
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

        function serializeData( data ) {
            if ( ! angular.isObject( data ) ) {
                return( ( data == null ) ? "" : data.toString() );
            }
            var buffer = [];
            for ( var name in data ) {
                if ( ! data.hasOwnProperty( name ) ) {
                    continue;
                }
                var value = data[ name ];
                buffer.push(
                    encodeURIComponent( name ) +
                    "=" +
                    encodeURIComponent( ( value == null ) ? "" : value )
                );
            }
            var source = buffer
                    .join( "&" )
                    .replace( /%20/g, "+" )
                ;
            return( source );
        }
    }
})();


