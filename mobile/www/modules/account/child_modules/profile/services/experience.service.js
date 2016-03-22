(function () {
    'use strict';

    angular
        .module('profile')
        .factory('experienceService', experienceService);

    experienceService.$inject = ['$http', '$q', 'settings'];

    function experienceService ($http, $q, settings) {

        function getUserExperience () {
            return $http.get(settings.usersExperience);
        }
        function postUserExperience (experience) {
            return $http.post(settings.usersExperience, experience);
        }
        function updateUserExperience (id, experience) {
            if (!id) { return $q.reject('No Experience ID Specified'); }

            var url = settings.usersExperience + id;
            return $http.put(url, experience);
        }
        function deleteUserExperience (id) {
            if (!id) { return $q.reject('No Experience ID Specified'); }

            var url = settings.usersExperience + id;
            return $http.delete(url);
        }

        return {
            getUserExperience: getUserExperience,
            postUserExperience: postUserExperience,
            updateUserExperience: updateUserExperience,
            deleteUserExperience: deleteUserExperience
        };
    }

})();
