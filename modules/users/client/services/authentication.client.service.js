(function () {
'use strict';

// Authentication service for user variables

    function AuthenticationService($window) {
        var service = {
            user: $window.user,
            isLoggedIn: isLoggedIn,
            isAdmin: isAdmin
        };
        
        return service;
        
        // Service Method Implementations
        function isLoggedIn() {
            return !_.isEmpty(service.user);
        }

        function isAdmin() {
            return !!service.user && service.user.isAdmin;
        }
	}

	AuthenticationService.$inject = ['$window'];

    angular
        .module('users')
        .factory('Authentication', AuthenticationService);


})();
