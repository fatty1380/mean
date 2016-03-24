(function () {
    'use strict';

    angular
        .module('profile')
        .factory('badgeService', badgeService);

    badgeService.$inject = ['$http', '$q'];

    function badgeService ($http, $q) {

        function getBadgeLevel () {
            return Math.floor(Math.random() * 4);
        }

        function getIconClass () {
            var badges = {
                0: 'bronze',
                1: 'silver',
                2: 'gold',
                3: 'none'
            };

            return badges[getBadgeLevel()];
        }

        return {
            getIconClass: getIconClass
        };
    }

})();
