(function () {
    'use strict';

    // Configuring the Job Applications module
    function menus(Menus) {

        Menus.addMenuItem('topbar', {
            title: 'Applicants',
            state: 'applications.list',
            userTypes: ['owner'],
            position: 20
        });
        Menus.addMenuItem('topbar', {
            title: 'My Applications',
            state: 'applications.list',
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
            state: 'applications.all'
        });
        Menus.addSubMenuItem('adminbar', 'applications', {
            title: 'New Application',
            state: 'applications.create'
        });
        Menus.addSubMenuItem('adminbar', 'applications', {
            title: 'My Applications',
            state: 'applications.list'
        });
    }

    menus.$inject = ['Menus'];

    angular
        .module('applications')
        .run(menus);

})();
