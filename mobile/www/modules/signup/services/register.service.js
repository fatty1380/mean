(function () {
    'use strict';

    function registerService ($http) {
        // var baseUrl = 'http://outset-shadow.elasticbeanstalk.com/api/auth/signup';
        var baseUrl = 'http://outset-d.elasticbeanstalk.com/';
        var service = {};
        var dataProps = {
            handle:"",
            props:{
                truck:"",
                trailer:"",
                started:""
            }
        };
        service.registerUser = registerUser;
        service.signIn = signIn;
        service.signOut = signOut;
        service.me = me;
        service.updateUser = updateUser;
        service.updateUserProps = updateUserProps;
        service.getProfiles = getProfiles;
        service.getProfilesID = getProfilesID;
        service.dataProps = dataProps;
        return service;

        function registerUser (data) {
            if (!data) return;
           // return requestApi("api/auth/signup" , "post", data)
            return requestApi("oauth/signup" , "post", data)
                .then(handleSuccess, handleError);
        }

        function updateUser (data) {
            if (!data) return;
            return requestApi("api/users" , "put", data, true)
                .then(handleSuccess, handleError);
        }

        function updateUserProps (data) {
            if (!data) return;
            return requestApi("api/users/me/props" , "put", data, true)
                .then(handleSuccess, handleError);
        }

        function signIn (data) {
            if (!data) return;
            data.username = data.email;
            return  requestApi("oauth/token/" , "post", data )
                .then(handleSuccess, handleError);
        }

        function signOut (data) {
            if (!data) return;
            return  requestApi("api/auth/signout" , "get" )
                .then(handleSuccess, handleError);
        }

        function me () {
            return  requestApi("api/users/me" , "get" )
                .then(handleSuccess, handleError);
        }

        function getProfiles () {
            return  requestApi("api/profiles" , "get" )
                .then(handleSuccess, handleError);
        }

        function getProfilesID (profileId) {
            return  requestApi("api/profiles/"+profileId , "get" )
                .then(handleSuccess, handleError);
        }

        function requestApi(apiUrl, method, data, needSerialize) {
            console.log("  ");
            console.log("  requestApi");
            console.log(apiUrl, method, data, !!needSerialize);
            $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded;charset=utf-8";

            return $http ({
                url: baseUrl + apiUrl,
                method: method,
                //data: serializeData(data)
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
    };

    angular
        .module('signup')
        .factory('registerService', registerService);
    registerService.$inject = ['$http'];
})();


