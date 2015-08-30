(function () {
    'use strict';

    // Authentication service for user variables

    
    angular
        .module('users')
        .factory('Authentication', AuthenticationService)
        .factory('TokenFactory', AuthTokenFactory)
        .factory('LoginService', LoginService);

    AuthenticationService.$inject = ['TokenFactory', '$window', '$q'];

    function AuthenticationService(TokenFactory, $window, $q) {
        var service = {
            user: $window.user,
            isLoggedIn: isLoggedIn,
            isAdmin: isAdmin
        };

        return service;
        
        // Service Method Implementations
        
        function isLoggedIn() {
            return !_.isEmpty(service.user) && !!TokenFactory.isValid();
        }

        function isAdmin() {
            return !!service.user && service.user.isAdmin;
        }
        
    }
    
    LoginService.$inject = ['$http', 'TokenFactory', '$window', '$q', 'Authentication'];
    function LoginService($http, TokenFactory, $window, $q, auth) {
        getUser();
        
        return {
            getUser: getUser,
            login: login,
            logout: logout
        };
        
        function login(credentials) {
            
            credentials.client_id = 'outset_webapp_dev';
            credentials.client_secret = 'supernanigans';
            credentials.grant_type = 'password';
            
            return $http.post('/oauth/token', credentials)
                .then(function success(response) {
                    console.log('Got Token Response: ', response);
                    TokenFactory.set('access_token', response.data.access_token);
                    TokenFactory.set('refresh_token', response.data.refresh_token);
                    TokenFactory.set('token_type', response.data.token_type);
                    TokenFactory.set('token_expires', Date.now() + response.data.expires_in);

                    return $http.get('api/users/me');
                })
                .then(function success(response) {
                    console.log('Got `me` Response: ', response);
                    return response.data;
                });
        }

        function logout() {
            TokenFactory.clear();
            return ($window.user = null);
        }
        
        function getUser() {
            if (!_.isEmpty(auth.user)) {
                return $q.resolve(auth.user);
            }
            
            if (!TokenFactory.isEmpty() && TokenFactory.isValid()) {
                // $http = $http || $injector.get('$http');
                return $http.get('api/users/me').then(
                    function success(response) {
                        console.log('Got `me` Response: ', response);
                        auth.user = response.data;
                        return auth.user;
                    },
                    function error(err) {
                        console.error('Got error Response: ', err);
                        $q.reject(err);
                    });
            } 
            else {
                return $q.reject();
            }
            
            
        }
    }

    AuthTokenFactory.$inject = ['$window'];

    function AuthTokenFactory($window) {

        var tokenKeys = [];

        return {
            set: set,
            get: get,
            clear: clear,
            isEmpty: isEmpty,
            isValid: isValid
        };

        function set(key, value) {
            if (_.isString(key)) {
                $window.localStorage[key] = value;
                tokenKeys.push(key);
            }
            else if (_.isObject(key)) {
                var response = key;
                console.info('Setting Tokens based on keys: ', _.keys(response));
                _.forOwn(response, function setValueForKey(k) {
                    $window.localStorage[k.key] = k.value;
                    tokenKeys.push(k.key);
                });
            } else {
                console.error('Unable to process args', { key: key, value: value });
            }
        }
        
        function get(key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        }
        
        function clear(key) {
            if (!!key) {
                set(key);
                _.remove(tokenKeys, key);
            }
            else {
                _.each(tokenKeys, function (key) {
                    set(key);
                    _.remove(tokenKeys, key);
                })
            }
        }
        
        function isEmpty() {
            return !get('access_token');
        }
        
        function isValid() {
            return !isEmpty() && Date.now() < get('token_expires');
        }
    }
})();
