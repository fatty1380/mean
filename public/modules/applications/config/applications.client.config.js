'use strict';

// Configuring the Job Applications module
function menus(Menus, Auth) {
    // Set top bar menu items
    if (!!Auth.user && Auth.user.roles.indexOf('admin') !== -1) {
        Menus.addMenuItem('topbar', 'Applications', 'applications', 'dropdown', '/applications(/create)?');
        Menus.addSubMenuItem('topbar', 'applications', 'List Applications', 'applications');
        Menus.addSubMenuItem('topbar', 'applications', 'New Application', 'applications/create');
        Menus.addSubMenuItem('topbar', 'applications', 'My Applications', 'applications/me');
    }
}

menus.$inject = ['Menus', 'Authentication'];

angular
    .module('applications')
    .run(menus);
