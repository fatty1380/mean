'use strict';

// Configuring the Job Applications module
function menus(Menus, Auth) {

    Menus.addMenuItem('topbar', {
        title: 'Active Applications',
        state: 'applications.mine',
        userTypes: ['owner'],
        position: 20
    });
    Menus.addMenuItem('topbar', {
        title: 'My Applications',
        state: 'applications.mine',
        userTypes: ['driver'],
        position: 20
    });

    // Set top bar menu items
    Menus.addMenuItem('adminbar', {
        title: 'Applications',
        state: 'applications',
        type: 'dropdown',
        roles: ['admin']
    });
    Menus.addSubMenuItem('adminbar', 'applications', {
        title: 'All Applications',
        state: 'applications.list'
    });
    Menus.addSubMenuItem('adminbar', 'applications', {
        title: 'New Application',
        state: 'applications.create'
    });
    Menus.addSubMenuItem('adminbar', 'applications', {
        title: 'My Applications',
        state: 'applications.mine'
    });
}

menus.$inject = ['Menus', 'Authentication'];

angular
    .module('applications')
    .run(menus);
