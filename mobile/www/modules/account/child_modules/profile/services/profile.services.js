(function () {
    'use strict';

    var profileService = function ($http, user) {
        var profileData = {},
            profilesList = [],
            getProfileByID = function (id) {
                if (!id) return;
                var url = 'http://outset-shadow.elasticbeanstalk.com/api/profiles/';
                $http
                    .get(url + id)
                    .success(function (response) {
                        profileData = response;
                        return profileData;
                    });
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
            getAllProfiles: getAllProfiles(),
            getCurrentUserProfile: getProfileByID(user.id)

        }
    };

    profileService.$inject = ['$http', 'user'];

    angular
        .module('profile')
        .factory('profileService', profileService);

})();
