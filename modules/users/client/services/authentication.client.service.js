'use strict';

// Authentication service for user variables

function AuthenticationService() {
    var _this = this;

    function isLoggedIn() {
        return !!_this._data.user;
    }

    function isAdmin() {
        var user = _this._data.user;
        return !!user && (user.roles.indexOf('admin') !== -1);
    }

    _this._data = {
        user: window.user,
        isLoggedIn: isLoggedIn,
        isAdmin: isAdmin
    };

    return _this._data;
}

angular
    .module('users')
    .factory('Authentication', AuthenticationService);
