'use strict';

// Setting up routes for the Users

function config($stateProvider) {
    // Users state routing

    $stateProvider.

    // === Users Parent State ======================================================

    state('users', {
        abstract: true,
        url: '/users',
        templateUrl: 'modules/core/views/fixed-clear.client.view.html',
        parent: 'full-opaque'
    }).

    /**
     * List all Users
     * @description Only available to admin users
     */
    state('users.list', {
        url: '',
        templateUrl: 'modules/users/views/list-users.client.view.html',
        parent: 'users'
    }).

    /**
     * View Profile
     * @description Allows a user to view another user's profile page.
     */
    state('users.view', {
        url: '/sourcet/:userId',
        templateUrl: 'modules/users/views/settings/profile.client.view.html',
        controller: 'ProfileController',
        parent: 'users'
    }).

    // === Profile Parent State ======================================================

    state('profile', {
            abstract: true,
            url: '/profile',
            templateUrl: 'modules/core/views/fixed-clear.client.view.html',
            parent: 'full-opaque'
        }).
        /**
         * Show *my* profile
         * @description Displays the logged in user's profile page
         */
    state('profile.me', {
        url: '', //'/settings/profile',
        templateUrl: 'modules/users/views/settings/profile.client.view.html',
        parent: 'profile'
    }).

    /**
     * Edit *my* profile
     * @description Displays the logged in user's profile page in EDIT mode
     */
    state('profile.edit', {
        url: '/edit', //'/settings/profile/edit',
        templateUrl: 'modules/users/views/settings/edit-profile.client.view.html',
        parent: 'profile'
    }).

    /**
     * Social Accounts
     * @description Allows the user to manage their connected social accounts
     */
    state('profile.accounts', {
        url: '/accounts',
        templateUrl: 'modules/users/views/settings/social-accounts.client.view.html',
        parent: 'profile'
    }).

    // === Password Parent State ======================================================

    state('password', {
        abstract: true,
        url: '/password',
        parent: 'fixed-opaque'
    }).

    /**
     * Change Password
     * @description Allows the user to change their password
     */
    state('password.edit', {
        url: '/edit', // '/settings/password',
        templateUrl: 'modules/users/views/settings/change-password.client.view.html',
        parent: 'password'
    }).

    /**
     * Forgot Password
     * @description Allows the user to reset their password
     */
    state('password.forgot', {
        url: '/forgot',
        templateUrl: 'modules/users/views/password/forgot-password.client.view.html',
        parent: 'password'
    }).

    /**
     * Password Reset - Invalid
     * @description Route if password reset was unsuccessful
     */
    state('password.reset-invalid', {
        url: '/reset/invalid',
        templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html',
        parent: 'password'
    }).

    /**
     * Password Reset - Success
     * @description Route if the password reset was successful
     */
    state('password.reset-success', {
        url: '/reset/success',
        templateUrl: 'modules/users/views/password/reset-password-success.client.view.html',
        parent: 'password'
    }).

    // === Auth Parent State ======================================================
    // TODO: Determine if these states are still required ...
    state('auth', {
        abstract: true,
        url: '/sign',
        templateUrl: 'modules/core/views/fixed-clear.client.view.html',
        controller: 'AuthenticationController',
        parent: 'full-opaque'
    }).

    /**
     * Signup
     * @description Allows a user to signup
     */
    state('auth.signup', {
        url: 'up/:signupType',
        templateUrl: 'modules/users/views/authentication/signup.client.view.html',
        parent: 'auth'
    }).

    /**
     * Signin
     * @description Allows the user to signin
     */
    state('auth.signin', {
        url: 'in',
        templateUrl: 'modules/users/views/authentication/signin.client.view.html',
        parent: 'auth'
    });

    /**
     * Signout
     * @description No client side route, handled by server call to GET '/auth/signout'
     * @link See server side code {users.authentication.server.controller.js}
     */
}

config.$inject = ['$stateProvider'];

angular
    .module('users')
    .config(config);
