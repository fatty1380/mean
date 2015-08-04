(function () {
    'use strict';

    function registerService ($http, settings) {
        var service = {};
        var dataProps = {
            handle:"",
            props:{
                truck:"",
                trailer:"",
                started:""
            }
        };

        var signinData = {
            grant_type: 'password',
            client_id: 'mobile_v0_1',
            client_secret: 'shenanigans'
        };

        service.registerUser = registerUser;
        service.signIn = signIn;
        service.signOut = signOut;
        service.me = me;
        service.updateUser = updateUser;
        service.updateUserProps = updateUserProps;
        service.getProfiles = getProfiles;
        service.getProfilesID = getProfilesID;

        //data
        service.dataProps = dataProps;
        return service;

        function registerUser (data) {
            if (!data) return;
           // return requestApi("api/auth/signup" , "post", data)
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
            data.username = data.email;
            data.grant_type = signinData.grant_type;
            data.client_id = signinData.client_id;
            data.client_secret = signinData.client_secret;
            return requestApi(settings.token, "post", data )
                .then(handleSuccess, handleError);
        }

        function signOut (data) {
            if (!data) return;
            return  requestApi(settings.signout , "get" )
                .then(handleSuccess, handleError);
        }

        function me () {
            return  requestApi(settings.usersProfile, "get" )
                .then(handleSuccess, handleError);
        }

        function getProfiles () {
            return  requestApi(settings.profiles , "get" )
                .then(handleSuccess, handleError);
        }

        function getProfilesID (profileId) {
            return  requestApi(settings.profiles + profileId , "get" )
                .then(handleSuccess, handleError);
        }

        function requestApi(apiUrl, method, data, needSerialize) {
            console.log("  ");
            console.log("requestApi: [%s] %s: serialize: %s - %o", method, apiUrl, !!needSerialize, data);
            
            $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded;charset=utf-8";

            return $http ({
                url: apiUrl,
                method: method,
                data: !needSerialize ? serializeData(data) : data
            })
        }

        function handleSuccess(response) {
            console.log('handleSuccess  ',response);
            return { success: true, message: response };
        }

        function handleError(response) {
            console.log('handleError  ',response);
            return { success: false, message: response, title: response.statusText  };
        }

        //
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

    registerService.$inject = ['$http', 'settings'];

    angular
        .module('signup')
        .factory('registerService', registerService);

})();


