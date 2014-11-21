'use strict';

// Configuring the Companies module
function menus(Menus, Auth) {
    // Set top bar menu items
    if (!!Auth.user && Auth.user.roles.indexOf('admin') !== -1) {
        Menus.addMenuItem('topbar', {title: 'Companies', state:'companies', type: 'dropdown'});
        Menus.addSubMenuItem('topbar', 'companies', {title: 'List Companies', state: 'companies.list'});
        Menus.addSubMenuItem('topbar', 'companies', {title: 'New Company', state:'companies.create'});
    }
}


menus.$inject = ['Menus', 'Authentication'];

angular
    .module('companies')
    .run(menus);
