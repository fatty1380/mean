(function () {
    'use strict';

    angular
        .module('profile')
        .factory('experienceService', experienceService);

    experienceService.$inject = ['$http', 'settings', 'utilsService'];

    function experienceService ($http, settings, utilsService) {
        var getUserExperience = function () {
                return $http.get(settings.usersExperience)
            },
            postUserExperience = function (experience) {
                return $http.post(settings.usersExperience, experience);
            },
            updateUserExperience = function (id, experience) {
                if(!id) return;

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
