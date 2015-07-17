(function () {
    'use strict';

    var profileService = function ($http, $q, user) {
        var profileData = {},
            profilesList = [],
            getProfileByID = function (id) {
                if (!id) return;

                var url = 'http://outset-shadow.elasticbeanstalk.com/api/profiles/' + id,
                    deferred = $q.defer();

                $http.get(url)
                    .success(function (response) {
                        deferred.resolve(response);
                    }).error(function (response) {
                        deferred.reject(response.message);
                    });

                return deferred.promise;
            },

            getAllProfiles = function () {
                var url = 'http://outset-shadow.elasticbeanstalk.com/api/profiles';
                $http
                    .get(url)
                    .success(function (response) {
                        profilesList = response;
                        return profilesList;
                    });
            };

        return{
            profileData: profileData,
            profilesList: profilesList,
            getProfileByID: getProfileByID,
            getAllProfiles: getAllProfiles()
        }
    };

    profileService.$inject = ['$http', '$q', 'user'];

    angular
        .module('profile')
        .factory('profileService', profileService);

})();
