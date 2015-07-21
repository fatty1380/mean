/**
 * Authentication interceptor.
 *
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   The MIT License {@link http://opensource.org/licenses/MIT}
 */
(function () {
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

                //@TODO add filter
                if(config.method == "GET" || config.method == "PUT" ){
                    config.url += ("?access_token="+tokenService.get('access_token'));
                  //  config.headers.Authorization = "Bearer "+tokenService.get('access_token');
                }

                console.log(" ");
                console.log(" ");
                console.log(config);
                return config;
            },
            responseError: function (rejection) {
                // revoke client authentication if 401 is received
                if (rejection != null && rejection.status === 401 && !!tokenService.get()) {
                    //tokenService.remove();
                    $location.path('/');
                }
                console.log("responseError ");
                return $q.reject(rejection);
            }
        };
    }

    angular
        .module('signup')
        .factory('AuthenticationInterceptor', AuthenticationInterceptor)
        .config(function ($httpProvider) {
            // we have to add the interceptor to the queue as a string because the interceptor depends upon service instances that are not available in the config block.
            $httpProvider.interceptors.push('AuthenticationInterceptor');
        });
})();
