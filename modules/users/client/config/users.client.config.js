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

function menus(Menus, Auth) {
    // Add menu for Users iff the user is an admin
    if (!!Auth.user && Auth.user.roles.indexOf('admin') !== -1) {
        Menus.addMenuItem('topbar', 'Users', 'users', 'dropdown', '/users(/create)?');
        Menus.addSubMenuItem('topbar', 'users', 'List Users', 'users');
        Menus.addSubMenuItem('topbar', 'users', 'New User', 'users/create');
    }
}

config.$inject = ['$httpProvider'];
menus.$inject = ['Menus', 'Authentication'];

angular
    .module('users', ['core'])
    .config(config)
    .run(menus);
