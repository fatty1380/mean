'use strict';

// Configuring the Companies module
function menus(Menus, Auth) {
    // Set top bar menu items
    if (!!Auth.user && Auth.user.roles.indexOf('admin') !== -1) {
        Menus.addMenuItem('topbar', 'Companies', 'companies', 'dropdown', '/companies(/create)?');
        Menus.addSubMenuItem('topbar', 'companies', 'List Companies', 'companies');
        Menus.addSubMenuItem('topbar', 'companies', 'New Company', 'companies/create');
    }
}


menus.$inject = ['Menus', 'Authentication'];

angular
    .module('companies')
    .run(menus);
