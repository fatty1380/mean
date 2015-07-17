
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

            //$http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;

            return $http({
                url: baseUrl + apiUrl,
                method: method,
                // { firstName:"testFN", lastName:"testLN", email:"test@test.ggg", password:"testtest"}
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



    var Base64 = {

        keyStr: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',

        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                    this.keyStr.charAt(enc1) +
                    this.keyStr.charAt(enc2) +
                    this.keyStr.charAt(enc3) +
                    this.keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            } while (i < input.length);

            return output;
        },

        decode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                window.alert("There were invalid base64 characters in the input text.\n" +
                    "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                    "Expect errors in decoding.");
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            do {
                enc1 = this.keyStr.indexOf(input.charAt(i++));
                enc2 = this.keyStr.indexOf(input.charAt(i++));
                enc3 = this.keyStr.indexOf(input.charAt(i++));
                enc4 = this.keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }

                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";

            } while (i < input.length);

            return output;
        }
    };


})();


