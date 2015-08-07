(function () {
    'use strict';

    var userService  = function () {
    };

    userService.$inject = [];

    angular
        .module(AppConfig.appModuleName)
        .factory('userService', userService);
})();
