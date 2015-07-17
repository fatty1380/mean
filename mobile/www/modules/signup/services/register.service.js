
(function () {
    'use strict';

    angular
        .module('signup')
        .factory('registerService', registerService);

    registerService.$inject = ['$http'];


    function registerService ($http) {

       // var baseUrl = 'http://outset-shadow.elasticbeanstalk.com/api/auth/signup';
        var baseUrl = 'http://outset-d.elasticbeanstalk.com/';
        var service = {};
        service.registerUser = registerUser;
        service.signIn = signIn;
        service.signOut = signOut;
        service.me = me;
        service.updateUser = updateUser;
        service.getProfiles = getProfiles;
        service.getProfilesID = getProfilesID;
        return service;

        function registerUser (data) {
            console.log(' ');
            console.log('registerService.registerUser');
            console.log('data' ,data);
            if (!data) return;
            return requestApi("api/auth/signup" , "post", data)
                .then(handleSuccess, handleError);
        }

        function updateUser (data) {
            console.log(' ');
            console.log('registerService.updateUser');
            console.log('data' ,data);
            if (!data) return;
            return requestApi("api/users" , "put", data)
                .then(handleSuccess, handleError);
        }

        function signIn (data) {
            console.log(' ');
            console.log('registerService.signIn');
            console.log('data' ,data);
            if (!data) return;
            return  requestApi("api/auth/signin" , "post", {  username: data.email, password: data.password } )
                .then(handleSuccess, handleError);
        }

        function signOut (data) {
            console.log(' ');
            console.log('registerService.signOut');
            console.log('data' ,data);
            if (!data) return;
            return  requestApi("api/auth/signout" , "get" )
                .then(handleSuccess, handleError);
        }

        function me () {
            console.log(' ');
            console.log('registerService.me');
            return  requestApi("api/users/me" , "get" )
                .then(handleSuccess, handleError);
        }

        function getProfiles () {
            console.log(' ');
            console.log('registerService.getProfiles');
            return  requestApi("api/profiles" , "get" )
                .then(handleSuccess, handleError);
        }

        function getProfilesID () {
            console.log(' ');
            console.log('registerService.getProfilesID');
            return  requestApi("api/profiles/55a8c832f58ef0900b7ca14c" , "get" )
                .then(handleSuccess, handleError);
        }

        function requestApi(apiUrl, method, data) {
            $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded;charset=utf-8";
            return $http ({
                url: baseUrl + apiUrl,
                method: method,
                data: serializeData( data )
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
            // If this is not an object, defer to native stringification.
            if ( ! angular.isObject( data ) ) {
                return( ( data == null ) ? "" : data.toString() );
            }
            var buffer = [];
            // Serialize each key in the object.
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
            // Serialize the buffer and clean it up for transportation.
            var source = buffer
                    .join( "&" )
                    .replace( /%20/g, "+" )
                ;
            return( source );
        }

    };


})();


