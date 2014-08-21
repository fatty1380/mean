'use strict';

// Setting up routes for the Users

function config($stateProvider) {
    // Users state routing
    $stateProvider.
    state('profile', {
        url: '/settings/profile',
        templateUrl: 'modules/users/views/settings/profile.client.view.html'
    })
        .
    state('profile-edit', {
        url: '/settings/profile/edit',
        templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
    })
        .
    state('password', {
        url: '/settings/password',
        templateUrl: 'modules/users/views/settings/change-password.client.view.html'
    })
        .
    state('accounts', {
        url: '/settings/accounts',
        templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
    })
        .
    state('signup', {
        url: '/signup',
        templateUrl: 'modules/users/views/signup.client.view.html'
    })
        .
    state('signin', {
        url: '/signin',
        templateUrl: 'modules/users/views/signin.client.view.html'
    });
}

config.$inject = ['$stateProvider'];

angular
    .module('users')
    .config(config);
