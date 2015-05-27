(function () {
'use strict';

// Authentication service for user variables

    function AuthenticationService($window) {
        var _this = this;

        function isLoggedIn() {
            return !_.isEmpty(_this._data.user);
        }

        function isAdmin() {
            return !!_this._data.user && _this._data.user.isAdmin;
        }

        _this._data = {
            user: $window.user,
            isLoggedIn: isLoggedIn,
            isAdmin: isAdmin
		};

		return _this._data;
	}

	AuthenticationService.$inject = ['$window'];

    angular
        .module('users')
        .factory('Authentication', AuthenticationService);


})();
