'use strict';

// Configuring the Articles module
function menus(Menus, Auth) {
    // Add menu for Drivers iff the user is an admin
    if (!!Auth.user && Auth.user.roles.indexOf('admin') !== -1) {
        Menus.addMenuItem('topbar', 'Drivers', 'drivers', 'dropdown', '/drivers(/create)?');
        Menus.addSubMenuItem('topbar', 'drivers', 'List Drivers', 'drivers');
        Menus.addSubMenuItem('topbar', 'drivers', 'New Driver', 'drivers/create');
    }
}

menus.$inject = ['Menus', 'Authentication'];

angular
    .module('drivers')
    .run(menus);
