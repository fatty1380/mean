'use strict';

// Configuring the Jobs module
angular.module('jobs').run(['Menus',
    function(Menus) {
        // Set top bar menu items
        Menus.addMenuItem('topbar', 'Jobs', 'jobs', 'dropdown', '/jobs(/create)?');
        Menus.addSubMenuItem('topbar', 'jobs', 'My Jobs', 'myjobs');
        Menus.addSubMenuItem('topbar', 'jobs', 'All Jobs', 'jobs');
        Menus.addSubMenuItem('topbar', 'jobs', 'New Job', 'jobs/create');
    }
]);
