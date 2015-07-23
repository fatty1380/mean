(function () {

    function tokenService($window) {

        return {
            set: function(key, value) {
                $window.localStorage[key] = value;
            },
            get: function(key, defaultValue) {
                return $window.localStorage[key] || defaultValue;
            }
        }
    }

    tokenService.$inject = ['$window'];

    angular
        .module('signup')
        .factory('tokenService', tokenService);
})();
