(function () {
    'use strict';

    angular
        .module('signup')
        .factory('welcomeService', welcomeService);

    welcomeService.$inject = [];

    function welcomeService () {
        var welcomeUser = false;

        return {
            welcomeUser: welcomeUser
        }

    }

})();


