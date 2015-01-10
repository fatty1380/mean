(function() {
    'use strict';

    // Config HTTP Error Handling
    function config($httpProvider) {
        // Set the httpProvider "not authorized" interceptor
        $httpProvider.interceptors.push(['$q', '$location', 'Authentication',
            function ($q, $location, Authentication) {
                return {
                    responseError: function (rejection) {
                        switch (rejection.status) {
                            case 401:
                                // Deauthenticate the global user
                                Authentication.user = null;

                                // Redirect to signin page
                                $location.path('signin');
                                break;
                            case 403:
                                // Add unauthorized behaviour
                                break;
                        }

                        return $q.reject(rejection);
                    }
                };
            }
        ]);
    }

    function menus(Menus) {

        // Setup Admin-Only menu Items
        Menus.addMenuItem('adminbar', {
            title: 'Users',
            state: 'users',
            type: 'dropdown',
            roles: ['admin']
        });

        Menus.addSubMenuItem('adminbar', 'users', {
            title: 'List Users',
            state: 'users.list'
        });

        Menus.addSubMenuItem('adminbar', 'users', {
            title: 'My User',
            state: 'users.view'
        });
    }

    config.$inject = ['$httpProvider'];
    menus.$inject = ['Menus'];

    angular
        .module('users', ['core'])
        .config(config)
        .run(menus);
})();
