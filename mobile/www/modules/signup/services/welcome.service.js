(function () {
    'use strict';

    angular
        .module('signup')
        .factory('welcomeService', welcomeService);

    welcomeService.$inject = [];

    function welcomeService () {
        var welcomeUser = false;
        var welcomeActivity = false;

        return {
            welcomeUser: welcomeUser,
            welcomeActivity: welcomeActivity
        }
    }
})();
