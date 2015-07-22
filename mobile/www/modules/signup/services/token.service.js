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

    angular
        .module('signup')
        .factory('tokenService', tokenService);
    tokenService.$inject = ['$window'];

})();
