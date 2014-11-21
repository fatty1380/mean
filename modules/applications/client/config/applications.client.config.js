'use strict';

// Configuring the Job Applications module
function menus(Menus, Auth) {
    // Set top bar menu items
    if (!!Auth.user && Auth.user.roles.indexOf('admin') !== -1) {
        Menus.addMenuItem('topbar', {
            title: 'Applications',
            state: 'applications',
            type: 'dropdown'
        });
        Menus.addSubMenuItem('topbar', 'applications', {
            title: 'List Applications',
            state: 'applications.list'
        });
        Menus.addSubMenuItem('topbar', 'applications', {
            title: 'New Application',
            state: 'applications.create'
        });
        Menus.addSubMenuItem('topbar', 'applications', {
            title: 'My Applications',
            state: 'applications.mine'
        });
    }
}

menus.$inject = ['Menus', 'Authentication'];

angular
    .module('applications')
    .run(menus);
