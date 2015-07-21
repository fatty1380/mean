(function () {
    'use strict';

    var profileService = function ($http, $q) {
        var profileData = {},
            profilesList = [],
            getProfile = function (id) {
                var url = 'http://outset-shadow.elasticbeanstalk.com/api/profiles/',
                    deferred = $q.defer();

                if(id) url += id;

                $http.get(url)
                    .success(function (response) {
                        deferred.resolve(response);
                    }).error(function (response) {
                        deferred.reject(response.message);
                    });

                return deferred.promise;
            };

        return{
            profileData: profileData,
            profilesList: profilesList,
            getProfile: getProfile
        }
    };

    profileService.$inject = ['$http', '$q'];

    angular
        .module('profile')
        .factory('profileService', profileService);

})();
