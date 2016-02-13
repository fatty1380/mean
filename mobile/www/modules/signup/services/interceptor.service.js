/**
 * Authentication interceptor.
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   The MIT License {@link http://opensource.org/licenses/MIT}
 */
(function () {
    'use strict';
    
    angular
        .module('signup')
        .factory('AuthenticationInterceptor', AuthenticationInterceptor)
        .config(function ($httpProvider) {
            $httpProvider.interceptors.push('AuthenticationInterceptor');
            
            $httpProvider.defaults.headers.post['Content-Type'] = 'application/json';
        });

    AuthenticationInterceptor.$inject = ['$q', '$rootScope', '$location', 'tokenService'];

    /**
     * @description
     * The http interceptor that listens for authentication failures.
     *
     * @param $q
     * @param $location
     * @param Token
     * @returns {{request: request, responseError: responseError}}
     * @constructor
     * @ngInject
     */
    function AuthenticationInterceptor($q, $rootScope, $location, tokenService) {
        return {
            request: function (config) {
                if (config.url.substring(0, 4) == "http") {
                    config.headers = config.headers || {};
                    config.headers.Authorization = tokenService.get('token_type') + " " + tokenService.get('access_token');
                }
                return config;
            },
            responseError: function (rejection) {
                // revoke client authentication if 401 is received
                if (rejection != null && rejection.status === 401) {
                    logger.error('[Auth Interceptor]  rejection --->>> %o', rejection);

                    $rootScope.$broadcast("clear");

                    return $location.path('/home');
                }
                return $q.reject(rejection);
            }
        };
    }
})();
