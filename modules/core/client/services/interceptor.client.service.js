/**
 * Authentication interceptor.
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   The MIT License {@link http://opensource.org/licenses/MIT}
 * 
 * Logic shared with Outset Mobile : mobile/www/modules/signup/services/interceptor.service.js
 */
(function () {

    angular
        .module('core')
        .factory('AuthenticationInterceptor', AuthenticationInterceptor)
        .config(function ($httpProvider) {
            $httpProvider.interceptors.push('AuthenticationInterceptor');
        });

    AuthenticationInterceptor.$inject = ['$q', '$location', 'TokenFactory'];

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
    function AuthenticationInterceptor($q, $location, TokenFactory) {
        return {
            request: function (config) {
                if (_.startsWith(config.url, 'http') || _.startsWith(config.url, 'api')) {
                    config.headers = config.headers || {};
                    config.headers.Authorization = [TokenFactory.get('token_type'), TokenFactory.get('access_token')].join(' ');
                }
                return config;
            },
            responseError: function (rejection) {
                debugger;
                // revoke client authentication if 401 is received
                if (rejection != null && rejection.status === 401 && !!TokenFactory.get()) {
                    $location.path('/');
                }
                return $q.reject(rejection);
            }
        };
    }
})();
