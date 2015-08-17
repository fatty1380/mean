(function () {
    'use strict';

    var experienceService = function ($http, settings) {
        var getUserExperience = function () {
                return $http.get(settings.usersExperience)
            },
            postUserExperience = function (experience) {
                return $http.post(settings.usersExperience, experience);
            },
            updateUserExperience = function (id, experience) {
                if(!id) return;

                var url = settings.experience + id;
                return $http.put(url, experience);
            };

        return {
            getUserExperience: getUserExperience,
            postUserExperience: postUserExperience,
            updateUserExperience: updateUserExperience
        }
    };

    experienceService.$inject = ['$http', 'settings'];

    angular
        .module('profile')
        .factory('experienceService', experienceService);
})();
