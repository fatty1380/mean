(function () {
    'use strict';

    angular
        .module('profile')
        .factory('experienceService', experienceService);

    experienceService.$inject = ['$http', '$q', 'settings', 'utilsService'];

    function experienceService ($http, $q, settings, utilsService) {
        var getUserExperience = function () {
            return $http.get(settings.usersExperience);
            },
            postUserExperience = function (experience) {
                return $http.post(settings.usersExperience, experience);
            },
            updateUserExperience = function (id, experience) {
                if (!id) { return $q.reject('No Experience ID Specified'); }

                var url = settings.usersExperience + id;
                return $http.put(url, experience);
            };

        return {
            getUserExperience: getUserExperience,
            postUserExperience: postUserExperience,
            updateUserExperience: updateUserExperience
        }
    }

})();
