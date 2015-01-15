(function () {
    'use strict';

// Configuring the Chat module
    angular.module('chat').run(['Menus',
        function (Menus) {
            // Set top bar menu items
            Menus.addMenuItem('adminbar', {
                title: 'Chat',
                state: 'chat',
                roles: ['Admin']
            });
            Menus.addMenuItem('topbar', {
                title: 'Chat',
                state: 'chat',
                roles: ['Admin']
            });
        }
    ]);

})();
