'use strict';

// Setting up routes for the Users

function config($stateProvider) {
    // Users state routing
    $stateProvider.
    /**
    * List all Users
    * @description Only available to admin users
    */
    state('listUsers', {
        url: '/users',
        templateUrl: 'modules/users/views/list-users.client.view.html'
    }).

    /**
    * Show *my* profile
    * @description Displays the logged in user's profile page
    */
    state('profile', {
        url: '/settings/profile',
        templateUrl: 'modules/users/views/settings/profile.client.view.html'
    }).

    /**
    * View Profile
    * @description Allows a user to view another user's profile page.
    */
    state('view-profile', {
        url: '/profiles/:userId',
        templateUrl: 'modules/users/views/settings/profile.client.view.html',
        controller: 'ProfileController'
    }).

    /**
    * Edit *my* profile
    * @description Displays the logged in user's profile page in EDIT mode
    */
    state('profile-edit', {
        url: '/settings/profile/edit',
        templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
    }).

    /**
    * Change Password
    * @description Allows the user to change their password
    */
    state('password', {
        url: '/settings/password',
        templateUrl: 'modules/users/views/settings/change-password.client.view.html'
    }).

    /**
    * Forgot Password
    * @description Allows the user to reset their password
    */
    state('forgot', {
        url: '/password/forgot',
        templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
    }).

    /**
    * Password Reset - Invalid
    * @description Route if password reset was unsuccessful
    */
    state('reset-invalid', {
        url: '/password/reset/invalid',
        templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
    }).

    /**
    * Password Reset - Success
    * @description Route if the password reset was successful
    */
    state('reset-success', {
        url: '/password/reset/success',
        templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
    }).

    /**
    * Social Accounts
    * @description Allows the user to manage their connected social accounts
    */
    state('accounts', {
        url: '/settings/accounts',
        templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
    }).

    /**
    * Signup
    * @description Allows a user to signup
    */
    state('signup', {
        url: '/signup/:signupType',
        templateUrl: 'modules/users/views/authentication/signup.client.view.html'
    }).

    /**
    * Signin
    * @description Allows the user to signin
    */
    state('signin', {
        url: '/signin',
        templateUrl: 'modules/users/views/authentication/signin.client.view.html'
    });
}

config.$inject = ['$stateProvider'];

angular
    .module('users')
    .config(config);
