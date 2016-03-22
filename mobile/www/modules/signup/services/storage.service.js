(function () {
    'use strict';

    angular
        .module('signup')
        .factory('StorageService', StorageService);

    StorageService.$inject = ['$window', '$rootScope', 'userService'];

    function StorageService($window, $rootScope, userService) {
        var userId = null;

        function setUserData () {
            userService.getUserData().then(function(profileData) {
                userId = profileData.id;
            });
        }

        function clearUserData() {
            userId = null;
        }

        setUserData();

        $rootScope.$on('clear', clearUserData());
   
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
