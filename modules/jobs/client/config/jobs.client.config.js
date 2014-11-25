'use strict';

// Configuring the Jobs module
function menus(Menus, Auth) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
        title: 'Jobs',
        state: 'jobs',
        type: 'dropdown'
    });
    Menus.addSubMenuItem('topbar', 'jobs', {
        title: 'My Jobs',
        state: 'jobs.mine'
    });
    Menus.addSubMenuItem('topbar', 'jobs', {
        title: 'All Jobs',
        state: 'jobs.list'
    });
    Menus.addSubMenuItem('topbar', 'jobs', {
        title: 'New Job',
        state: 'jobs.create'
    });

}

menus.$inject = ['Menus', 'Authentication'];

angular
    .module('jobs')
    .run(menus);
