(function () {
    'use strict';

// Setting up route
    angular.module('users').config(['$stateProvider',
        function ($stateProvider) {
            // Users state routing
            $stateProvider.

                // === Users Settings ======================================================

                state('settings', {
                    abstract: true,
                    url: '/settings',
                    templateUrl: 'modules/users/views/settings/settings.client.view.html',
                    parent: 'fixed-opaque'
                }).

                state('settings.profile', {
                    url: '/profile',
                    templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
                }).

            /**
             * Change Password
             * @description Allows the user to change their password
             */
                state('settings.password', {
                    url: '/password',
                    templateUrl: 'modules/users/views/settings/change-password.client.view.html'
                }).

                state('settings.accounts', {
                    url: '/accounts',
                    templateUrl: 'modules/users/views/settings/manage-social-accounts.client.view.html'
                }).

                state('settings.picture', {
                    url: '/picture',
                    templateUrl: 'modules/users/views/settings/change-profile-picture.client.view.html',
                    resolve: {
                        user : ['Authentication', function(auth) {
                            return auth.user;
                        }]
                    },
                    controller: ['Authentication', 'user', function(auth, user) {
                        var vm = this;
                        vm.user = user;

                        // Change Picture Success method:
                        vm.successFunction = function (fileItem, response, status, headers) {
                            // Populate user object
                            debugger;
                            vm.user = response;
                            vm.imageURL = vm.user.profileImageURL;

                            auth.user.profileImageURL = response.profileImageURL;

                            vm.showPhotoEdit = false;
                        };
                    }],
                    controllerAs: 'vm',
                    bindToController: true
                }).

            /** === Users Parent State ======================================================
             * The following states relate to the viewing of users, other than the logged in user.
             * These states can be used to view a driver's information, or for an admin to view all available users
             */
                state('users', {
                    abstract: true,
                    url: '/users',
                    template: '<div ui-view class="content-section"></div>',
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
                    url: '/:userId',
                    templateUrl: 'modules/users/views/settings/profile.client.view.html',
                    controller: 'ProfileController',
                    parent: 'users'
                }).


            /** === Authentication States ======================================================
             * The following states relate to the authentication of users, whether logging in
             * or signing up.
             */
                state('authentication', {
                    url: '/authentication',
                    templateUrl: 'modules/users/views/authentication/authentication.client.view.html'
                }).

            /** === Password States ======================================================
             * These states handle forgotten and resetting of passwords by users.
             */

                state('password', {
                    abstract: true,
                    url: '/password',
                    template: '<ui-view/>',
                    parent: 'fixed-opaque'
                }).

            /**
             * Forgot Password
             * @description Allows the user to reset their password
             */
                state('password.forgot', {
                    url: '/forgot',
                    templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
                }).

                state('password.reset', {
                    abstract: true,
                    url: '/reset',
                    template: '<ui-view/>'
                }).

            /**
             * Password Reset - Invalid
             * @description Route if password reset was unsuccessful
             */
                state('password.reset.invalid', {
                    url: '/invalid',
                    templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
                }).

            /**
             * Password Reset - Success
             * @description Route if the password reset was successful
             */
                state('password.reset.success', {
                    url: '/success',
                    templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
                }).

            /**
             * Password Reset - Form
             * @description Route for resetting a password based on a form
             */
                state('password.reset.form', {
                    url: '/:token',
                    templateUrl: 'modules/users/views/password/reset-password.client.view.html'
                });
        }
    ]);


})();
