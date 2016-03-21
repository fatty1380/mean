(function() {
    'use strict';

    angular
        .module('signup')
        .factory('tokenService', tokenService);

    tokenService.$inject = ['$rootScope', '$window'];

    function tokenService($rootScope, $window) {

        $rootScope.$on('clear', function() {
            $window.localStorage.removeItem('access_token');
            $window.localStorage.removeItem('refresh_token');
            $window.localStorage.removeItem('token_type');
        });

        return {
            set: set,
            get: get
        };

        /** ----------------------------------------------------------- */
        function set(key, value) {
            $window.localStorage[key] = value;
        }

        function get(key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        }


    }
})();

