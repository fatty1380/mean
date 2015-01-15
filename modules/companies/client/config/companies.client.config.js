(function() {
    'use strict';

    // Configuring the Companies module
    function menus(Menus, Auth) {
        // Set top bar menu items
        Menus.addMenuItem('topbar', {
            title: 'Dashboard',
            state: 'companies.home',
            userTypes: ['owner'],
            position: 1
        });

        Menus.addMenuItem('adminbar', {
            title: 'Companies',
            state: 'companies',
            type: 'dropdown',
            roles: ['admin']
        });
        Menus.addSubMenuItem('adminbar', 'companies', {
            title: 'List Companies',
            state: 'companies.list'
        });
        Menus.addSubMenuItem('adminbar', 'companies', {
            title: 'New Company',
            state: 'companies.create'
        });
    }


    menus.$inject = ['Menus', 'Authentication'];

    angular
        .module('companies')
        .run(menus);
})();
