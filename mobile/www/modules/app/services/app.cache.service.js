(function () {
    'use strict';

    angular
        .module(AppConfig.appModuleName)
        .factory('appCache', AppCache);

    AppCache.$inject = ['outsetCache'];

    function AppCache (outsetCache) {

        function cacheProfile (profile) {
            var cachedProfiles = outsetCache.get('userProfiles');
            var cacheIndex;

            if (cachedProfiles instanceof Array && cachedProfiles.length) {
                cacheIndex = _.findIndex(cachedProfiles, function (cachedProfile) {
                    return cachedProfile.id === profile.id;
                });

                if (cacheIndex >= 0) {
                    cachedProfiles[cacheIndex] = profile;
                } else {
                    cachedProfiles.push(profile);
                }
                outsetCache.put('userProfiles', cachedProfiles);
            } else {
                outsetCache.put('userProfiles', [profile]);
            }
        }

        function getCachedProfiles () {
            return outsetCache.get('userProfiles');
        }

        function getProfile (id) {
            var profiles = getCachedProfiles(),
                profile;

            if (profiles instanceof Array && profiles.length) {
                profile = _.find(profiles, { id: id });
                return profile;
            }
        }

        return {
            getProfile: getProfile,
            cacheProfile: cacheProfile,
            getCachedProfiles: getCachedProfiles
        };
    }

})();
