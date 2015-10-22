(function () {
    'use strict';

    // Create the Socket.io wrapper service

    angular.module('core').service('Socket', SocketService);

    SocketService.$inject = ['Authentication', '$state', '$timeout'];
    function SocketService(Authentication, $state, $timeout) {
        // Connect to the Socket.io server only when authenticated
        if (Authentication.user) {
            this.socket = io();
        }

        // Wrap the Socket.io 'on' method
        this.on = function (eventName, callback) {
            if (this.socket) {
                this.socket.on(eventName, function (data) {
                    $timeout(function () {
                        console.log('[Socket.on] `%s`. Data: %o', eventName, data);
                        callback(data);
                    });
                });
            }
        };

        // Wrap the Socket.io 'emit' method
        this.emit = function (eventName, data) {
            if (this.socket) {
                console.log('[Socket.emit] %s: %o', eventName, data);
                this.socket.emit(eventName, data);
            }
        };

        // Wrap the Socket.io 'removeListener' method
        this.removeListener = function (eventName) {
            if (this.socket) {
                this.socket.removeListener(eventName);
            }
        };
    }
})();