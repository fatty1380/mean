(function () {
    'use strict';

    angular
        .module('signup')
        .factory('StorageService', StorageService);

    StorageService.$inject = ['$window', 'userService'];

    function StorageService ($window, userService) {
        return {
            set: function (key, value, id) {
                $window.localStorage[id || userService.userId + '.' + key] = value;
            },
            get: function (key, defaultValue, id) {
                return $window.localStorage[id || userService.userId + '.' + key] || defaultValue || null;
            },
            remove: function (key, id) {
                return $window.localStorage.removeItem(id || userService.userId + '.' + key);
            }
        };
    }
})();
