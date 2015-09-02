/**
 * Authentication interceptor.
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   The MIT License {@link http://opensource.org/licenses/MIT}
 */
(function () {

    angular
        .module('signup')
        .factory('AuthenticationInterceptor', AuthenticationInterceptor)
        .config(function ($httpProvider) {
            $httpProvider.interceptors.push('AuthenticationInterceptor');
        });

    AuthenticationInterceptor.$inject = ['$q', '$location', 'tokenService'];

    'use strict';
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
    function AuthenticationInterceptor($q, $location, tokenService) {
        return {
            request: function (config) {
                if (config.url.substring(0, 4) == "http") {
                    config.headers = config.headers || {};
                    config.headers.Authorization = tokenService.get('token_type') + " " + tokenService.get('access_token');
                    console.log('Interceptor] Added headers to request: %j', config.headers);
                }
                return config;
            },
            responseError: function (rejection) {
                // revoke client authentication if 401 is received
                if (rejection != null && rejection.status === 401) {
                    console.warn('  eqweqe --->>> %o', rejection);
                    return $location.path('/home');
                }
                return $q.reject(rejection);
            }
        };
    }
})();
