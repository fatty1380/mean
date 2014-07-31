'use strict';

// Authentication service for user variables

function Authentication() {
    var _this = this;

    _this._data = {
        user: window.user
    };

    return _this._data;
}

angular
    .module( 'users' )
    .factory( 'Authentication', Authentication );
