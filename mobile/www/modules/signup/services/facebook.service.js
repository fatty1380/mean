(function() {
    'use strict';

    angular
        .module('signup')
        .factory('FacebookService', FacebookService);

    FacebookService.$inject = ['$ngCordovaFacebook', '$http', '$q', 'settings', 'tokenService'];
    function FacebookService(facebook, $http, $q, settings, tokenService) {

        var _userData = {
            props: {}
        };

        var service = {
            getFBUser: getFBUser,
            login: doFBLogin,
            getUserInfo: getUserInfo
        };


        var fbAppId = AppConfig.getFBKey();

        return service;

        // //////////////////////////////////////////////////////////////

        function getFBUser() {

            return getFBToken()
                .then(function(accessToken) {

                    var fields = ['id', 'email', 'name', 'first_name', 'last_name', 'work', 'picture'];

                    return getUserInfo(fields)
                        .then(function(result) {
                            var fbProfile = result.data;

                            var profilePic = 'https//graph.facebook.com/' + fbProfile.id + '/picture?type=large';

                            _userData = _.extend(_userData, {
                                firstName: fbProfile.first_name,
                                lastName: fbProfile.last_name,
                                email: fbProfile.email,
                                profileImageURL: profilePic || fbProfile.picture && fbProfile.picture.data && fbProfile.picture.data.url,
                                password: tokenService.get('fb_access_token'),
                                provider: 'facebook',
                                providerData: { accessToken: tokenService.get('fb_access_token') },
                                props: { facebookId: fbProfile.id }
                            });

                            return _userData;
                        });
                });
        }

        function doFBLogin() {
            return getFBToken()
                .then(function(accessToken) {

                    var fields = ['id', 'email'];

                    return $http.get('https://graph.facebook.com/v2.4/me', {
                        params: {
                            'access_token': accessToken,
                            fields: fields.join(','),
                            format: 'json'
                        }
                    });
                })
                .then(function(result) {
                    var fbProfile = result.data;

                    var profilePic = 'https//graph.facebook.com/' + fbProfile.id + '/picture?type=large';

                    _userData = _.extend(_userData, {
                        email: fbProfile.email,
                        provider: 'facebook',
                        providerData: { accessToken: tokenService.get('fb_access_token') },
                        props: { facebookId: fbProfile.id }
                    });

                    return _userData;
                });
        }

        function getUserInfo(fields) {

            fields = fields || ['id', 'email'];

            if (isValidToken()) {

                return $http
                    .get('https://graph.facebook.com/v2.4/me', {
                        params: {
                            'access_token': accessToken,
                            fields: fields.join(','),
                            format: 'json'
                        }
                    })
            }

            if (_.isEmpty(tokenService.get('fb_access_token'))) {
                return $q.reject('No FB Access Token Available');
            }

            if (moment().isAfter(moment(tokenService.get('fb_access_expires')))) {
                return $q.reject('FB Access Token is Expired')
            }

            return $q.reject('No Valid FB Access Token');
        }

        // ////////////////////////////////////////////////////////////////////        

        function isValidToken() {
            return !_.isEmpty(tokenService.get('fb_access_token')) && moment().isBefore(moment(tokenService.get('fb_access_expires')));
        }

        function getFBToken() {
            var fbGetTokenRequest = isValidToken() ?
                $q.when(tokenService.get('fb_access_token')) :
                facebook.signin(fbAppId, ['email', 'read_stream', 'user_website', 'user_location', 'user_relationships'])
                    .then(function(result) {

                        tokenService.set('fb_access_token', result.access_token);
                        tokenService.set('fb_access_expires', moment().add(result.expires_in, 'seconds').toISOString());

                        return tokenService.get('fb_access_token');
                    });

            return fbGetTokenRequest;
        }
    }
})();


