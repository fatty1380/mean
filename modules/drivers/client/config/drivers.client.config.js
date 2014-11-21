'use strict';

// Configuring the Drivers module
function menus(Menus, Auth) {
    // Add menu for Drivers iff the user is an admin
    if (!!Auth.user && Auth.user.roles.indexOf('admin') !== -1) {
        Menus.addMenuItem('topbar', {
            title: 'Drivers',
            state: 'drivers',
            type: 'dropdown'
        });
        Menus.addSubMenuItem('topbar', 'drivers', {
            title: 'List Drivers',
            state: 'drivers.list'
        });
        Menus.addSubMenuItem('topbar', 'drivers', {
            title: 'New Driver',
            state: 'drivers.create'
        });
    }
}

menus.$inject = ['Menus', 'Authentication'];

angular
    .module('drivers')
    .run(menus);
