'use strict';

// Configuring the Drivers module
function menus(Menus, Auth) {

    Menus.addMenuItem('topbar', {
        title: 'Dashboard',
        state: 'drivers.me',
        position: 1,
        userTypes: ['driver']
    });

    // Add menu for Drivers iff the user is an admin
    Menus.addMenuItem('adminbar', {
        title: 'Drivers',
        state: 'drivers',
        type: 'dropdown',
        roles: ['Admin']

    });
    Menus.addSubMenuItem('adminbar', 'drivers', {
        title: 'List Drivers',
        state: 'drivers.list'
    });
    Menus.addSubMenuItem('adminbar', 'drivers', {
        title: 'New Driver',
        state: 'drivers.create'
    });
}

menus.$inject = ['Menus', 'Authentication'];

angular
    .module('drivers')
    .run(menus);
