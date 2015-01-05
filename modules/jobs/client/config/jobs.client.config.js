'use strict';

// Configuring the Jobs module
function menus(Menus, Auth) {

    Menus.addMenuItem('topbar', {
        title: 'Job Postings',
        state: 'jobs.list',
        userTypes: ['driver', 'owner'],
        position: 10
    });


    // Set admin menu items
    Menus.addMenuItem('adminbar', {
        title: 'Jobs',
        state: 'jobs',
        type: 'dropdown',
        roles: ['Admin']
    });
    Menus.addSubMenuItem('adminbar', 'jobs', {
        title: 'My Jobs',
        state: 'jobs.mine'
    });
    Menus.addSubMenuItem('adminbar', 'jobs', {
        title: 'All Jobs',
        state: 'jobs.list'
    });
    Menus.addSubMenuItem('adminbar', 'jobs', {
        title: 'New Job',
        state: 'jobs.create'
    });

}

menus.$inject = ['Menus', 'Authentication'];

angular
    .module('jobs')
    .run(menus);
