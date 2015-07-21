(function () {

    function tokenService($window) {

        return {
            set: function(key, value) {
                $window.localStorage[key] = value;
                console.log('set: ', key,value);
            },
            get: function(key, defaultValue) {
                console.log('get: ', $window.localStorage[key] || defaultValue);
                return $window.localStorage[key] || defaultValue;
            },
            setObject: function(key, value) {
                $window.localStorage[key] = JSON.stringify(value);
            },
            getObject: function(key) {
                return JSON.parse($window.localStorage[key] || '{}');
            }
        }
    }

    angular
        .module('signup')
        .factory('tokenService', tokenService);
    tokenService.$inject = ['$window'];

})();
