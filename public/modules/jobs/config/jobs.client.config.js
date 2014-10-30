'use strict';

// Configuring the Jobs module
function menus(Menus, Auth) {
    // Set top bar menu items
    if (!!Auth.user && Auth.user.roles.indexOf('admin') !== -1) {
        Menus.addMenuItem('topbar', 'Jobs', 'jobs', 'dropdown', '/jobs(/create)?');
        Menus.addSubMenuItem('topbar', 'jobs', 'My Jobs', 'myjobs');
        Menus.addSubMenuItem('topbar', 'jobs', 'All Jobs', 'jobs');
        Menus.addSubMenuItem('topbar', 'jobs', 'New Job', 'jobs/create');
    }
}

menus.$inject = ['Menus', 'Authentication'];

angular
    .module('jobs')
    .run(menus);
