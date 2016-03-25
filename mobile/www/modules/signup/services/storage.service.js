(function () {
    'use strict';

    angular
        .module('signup')
        .factory('StorageService', StorageService);

    StorageService.$inject = ['$window', '$q', '$rootScope', 'userService'];

    function StorageService ($window, $q, $rootScope, userService) {

        function getUserId () {
            return userService.getUserData()
                .then(function (profileData) {

                    if (profileData === null) {
                        return false;
                    }
                    return profileData.id || null;
                })
                .catch(function (err) {
                    throw err;
                });
        }

        function getId (id) {
            return !!id ? $q.when(id) : getUserId();
        }

        return {
            set: function (key, value, id) {
                return getId(id)
                    .then(function (resolvedId) {
                        if (!resolvedId) {
                            logger.debug('userId is not available, resolving to:', false);
                            return false;
                        }
                        return $window.localStorage[resolvedId + '.' + key] = angular.toJson(value);
                    });
            },
            get: function (key, defaultValue, id) {
                return getId(id)
                    .then(function (resolvedId) {
                        return angular.fromJson($window.localStorage[resolvedId + '.' + key] || null);
                    });
            },
            remove: function (key, id) {
                return getId(id)
                    .then(function (resolvedId) {
                        return $window.localStorage.removeItem(resolvedId + '.' + key);
                    });
            }
        };
    }
})();
