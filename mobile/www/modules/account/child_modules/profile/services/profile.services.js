(function () {
    'use strict';

    var profileService = function ($http, registerService, settings) {
        var profileData = {},
            profilesList = [],
            getProfileByID = function (id) {
                if(!id) return;
                return $http.get(settings.profile + id);
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

    profileService.$inject = ['$http', 'registerService', 'settings'];

    angular
        .module('profile')
        .factory('profileService', profileService);

})();
