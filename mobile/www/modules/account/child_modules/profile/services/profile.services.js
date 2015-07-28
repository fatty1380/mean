(function () {
    'use strict';

    var profileService = function ($http, registerService ) {
        var profileData = {},
            url = 'http://outset-shadow.elasticbeanstalk.com/api/profiles/',
            profilesList = [],
            getProfileByID = function (id) {
                if(id) url += id;
                return $http.get(url);
            },
            getMyProfile = function () {
                return registerService.me()
                    .then(function (response) {
                        if(response.success) {
                            return getProfileByID(response.message.data.id);
                        }
                    });
            };
        
        return{
            profileData: profileData,
            profilesList: profilesList,
            getProfile: getProfileByID,
            getMyProfile: getMyProfile
        }
    };

    profileService.$inject = ['$http', 'registerService'];

    angular
        .module('profile')
        .factory('profileService', profileService);

})();
