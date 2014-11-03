'use strict';

<<<<<<< .merge_file_h8o90j
// Setting up routes for the Users

function config($stateProvider) {
    // Users state routing
    $stateProvider.
    state('profile', {
        url: '/settings/profile',
        templateUrl: 'modules/users/views/settings/profile.client.view.html',
        controller: 'ProfileController',
    }).
    state('profile-edit', {
        url: '/settings/profile/edit',
        templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
    }).
    state('password', {
        url: '/settings/password',
        templateUrl: 'modules/users/views/settings/change-password.client.view.html'
    }).
    state('accounts', {
        url: '/settings/accounts',
        templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
    }).
    state('signup', {
        url: '/signup/:signupType',
        templateUrl: 'modules/users/views/authentication/signup.client.view.html'
    }).
    state('signin', {
        url: '/signin',
        templateUrl: 'modules/users/views/authentication/signin.client.view.html'
    }).
    state('forgot', {
        url: '/password/forgot',
        templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
    }).
    state('reset-invlaid', {
        url: '/password/reset/invalid',
        templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
    }).
    state('reset-success', {
        url: '/password/reset/success',
        templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
    }).
    state('reset', {
        url: '/password/reset/:token',
        templateUrl: 'modules/users/views/password/reset-password.client.view.html'
    }).

    state('view-profile', {
        url: '/profiles/:userId',
        templateUrl: 'modules/users/views/settings/profile.client.view.html',
        controller: 'ProfileController'
    });
}

config.$inject = ['$stateProvider'];

angular
    .module('users')
    .config(config);
=======
// Setting up route
angular.module('users').config(['$stateProvider',
	function($stateProvider) {
		// Users state routing
		$stateProvider.
		state('profile', {
			url: '/settings/profile',
			templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
		}).
		state('password', {
			url: '/settings/password',
			templateUrl: 'modules/users/views/settings/change-password.client.view.html'
		}).
		state('accounts', {
			url: '/settings/accounts',
			templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
		}).
		state('signup', {
			url: '/signup',
			templateUrl: 'modules/users/views/authentication/signup.client.view.html'
		}).
		state('signin', {
			url: '/signin',
			templateUrl: 'modules/users/views/authentication/signin.client.view.html'
		}).
		state('forgot', {
			url: '/password/forgot',
			templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
		}).
		state('reset-invalid', {
			url: '/password/reset/invalid',
			templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
		}).
		state('reset-success', {
			url: '/password/reset/success',
			templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
		}).
		state('reset', {
			url: '/password/reset/:token',
			templateUrl: 'modules/users/views/password/reset-password.client.view.html'
		});
	}
]);
>>>>>>> .merge_file_8DXarh
