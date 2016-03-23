(function() {
    'use strict';

    angular
        .module('signup')
        .factory('StorageService', StorageService);

    StorageService.$inject = ['$window', '$q', '$rootScope', 'userService'];

    function StorageService($window, $q, $rootScope, userService) {
        
        function getUserId() {
            return userService.getUserData()
                .then(function(profileData) {
                    return profileData.id;
                });
        }

        function getId(id) {
            return !!id ? $q.when(id) : getUserId();
        }

        return {
            set: function(key, value, id) {
                return getId(id)
                    .then(function(resolvedId) {
                        return $window.localStorage[resolvedId + '.' + key] = angular.toJson(value);
                    });
            },
            get: function(key, defaultValue, id) {
                // debugger;
                return getId(id)
                    .then(function(resolvedId) {
                        debugger;
                        return angular.fromJson($window.localStorage[resolvedId + '.' + key] || null);
                    });
                // return item;
            },
            remove: function(key, id) {
                return getId(id)
                    .then(function(resolvedId) {
                        return $window.localStorage.removeItem(resolvedId + '.' + key);
                    });
            }
        };
    }
})();






