(function () {
    'use strict';

// Configuring the Jobs module
    function menus(Menus) {

        Menus.addMenuItem('topbar', {
            title: 'My Reports',
            state: 'reviewReports',
            userTypes: ['driver'],
            position: 30
        });


        // Set admin menu items
        Menus.addMenuItem('adminbar', {
            title: 'Jobs',
            state: 'bgchecks',
            type: 'dropdown',
            roles: ['Admin']
        });
        Menus.addSubMenuItem('adminbar', 'bgchecks', {
            title: 'My Jobs',
            state: 'bgchecks.mine'
        });
        Menus.addSubMenuItem('adminbar', 'bgchecks', {
            title: 'All Jobs',
            state: 'bgchecks.list'
        });
        Menus.addSubMenuItem('adminbar', 'bgchecks', {
            title: 'New Job',
            state: 'bgchecks.create'
        });

    }

    menus.$inject = ['Menus'];

    angular
        .module('bgchecks')
        .run(menus);

})();
