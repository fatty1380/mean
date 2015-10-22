(function () {
    'use strict';

    // Setting up route
    angular.module('users').config(['$stateProvider',
        function ($stateProvider) {
            var upcResolve = {
                user: ['Authentication', 'LoginService', function resolveUser(Authentication, LoginService) {
                    return LoginService.getUser().then(
                        function success(user) {

                            if (!Authentication.user) {
                                debugger;
                                Authentication.user = user;
                            }

                            return user;
                        },
                        function reject(reason) {
                            console.error('Unable to load user - not logged in?', reason);

                            return null;
                        });
                }],
                profile: ['user', '$stateParams', 'Profiles', function resolveProfile(user, $stateParams, Profiles) {
                    if (_.isEmpty($stateParams.userId)) {
                        return user;
                    }

                    return Profiles.load($stateParams.userId).then(
                        function success(profile) {
                            return profile;
                        },
                        function reject(reason) {
                            console.error('Unable to load profile: ', reason);

                            debugger;

                            return null;

                        });
                }],
                company: ['profile', 'Companies', function resolveCompany(profile, Companies) {
                    return !!profile.company ? Companies.get(profile.company) : null;
                }]
            };
            
            // Users state routing
            $stateProvider.
            
            // === Profile Base ========================================================
            // Sets up some baseline state resolves and a 3 part layout
                state('profile-base', {
                    abstract: true,
                    views: {
                        '': {
                            templateUrl: '/modules/core/views/profile-base.client.template.html',
                            controller: ['user', 'profile', function (user, profile) {
                                var vm = this;

                                vm.user = user;
                                vm.profile = profile || user;
                            }],
                            controllerAs: 'vm',
                            bindToController: true
                        },
                        'content@profile-base': {
                            template: '<h1 class="text-center">CONTENT</h1>'
                        },
                        'sidebar@profile-base': {
                            templateUrl: '/modules/drivers/views/templates/my-driver-sidebar.client.view.html',
                            controller: ['user', 'profile', 'Friends', function (user, profile, Friends) {
                                var vm = this;
                                vm.user = user;
                                vm.profile = profile;
                                vm.friends = null;

                                initialize();
                                
                                ////////////////////////////////////
                                
                                function initialize() {
                                    var friendOne = _.first(vm.user.friends);

                                    debugger;
                                    if (_.isString(friendOne)) {
                                        Friends.query({ user: vm.user.id }).then(
                                            function (results) {
                                                vm.friends = results;
                                            });
                                    } else {
                                        vm.friends = vm.user.friends;
                                    }
                                }

                            }],
                            controllerAs: 'vm',
                            bindToController: true
                        }
                    },
                    resolve: upcResolve
                }).

            // === Users Settings ======================================================

                state('settings', {
                    abstract: true,
                    url: '/settings',
                    templateUrl: '/modules/users/views/settings/settings.client.view.html',
                    parent: 'fixed-opaque'
                }).

                state('settings.profile', {
                    url: '/profile',
                    templateUrl: '/modules/users/views/settings/edit-profile.client.view.html'
                }).

            /**
             * Change Password
             * @description Allows the user to change their password
             */
                state('settings.password', {
                    url: '/password',
                    templateUrl: '/modules/users/views/settings/change-password.client.view.html'
                }).

                state('settings.accounts', {
                    url: '/accounts',
                    templateUrl: '/modules/users/views/settings/manage-social-accounts.client.view.html'
                }).

                state('settings.picture', {
                    url: '/picture',
                    templateUrl: '/modules/users/views/settings/change-profile-picture.client.view.html',
                    resolve: {
                        user: ['Authentication', function (auth) {
                            return auth.user;
                        }]
                    },
                    controller: ['Authentication', 'user', function (auth, user) {
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
                    template: '<div ui-view class="content-section container"></div>',
                    parent: 'fixed-opaque'
                }).

            /**
             * List all Users
             * @description Only available to admin users
             */
                state('users.list', {
                    url: '',
                    templateUrl: '/modules/users/views/list-users.client.view.html',
                    parent: 'users',
                    controller: 'UserListController',
                    controllerAs: 'vm',
                    bindToController: true,
                    resolve: {
                        users: ['Profiles', function (Profiles) {
                            return Profiles.query();
                        }]
                    }
                }).

            /**
             * View Profile
             * @description Allows a user to view another user's profile page.
             */

                state('users.view', {
                    parent: 'profile-base',
                    url: '/profile/{userId:[0-9a-fA-F]{24}}',
                    views: {
                        'content': {
                            templateUrl: '/modules/drivers/views/templates/driver-body.client.view.html',
                            controller: ['user', 'profile', function (user, profile) {
                                var vm = this;
                                vm.user = user;
                                vm.profile = profile;
                            }],
                            controllerAs: 'vm',
                            bindToController: true
                        }
                    },
                    controller: 'ProfileController',
                    controllerAs: 'vm',
                    bindToController: true
                }).


            /** === Authentication States ======================================================
             * The following states relate to the authentication of users, whether logging in
             * or signing up.
             */
                state('authentication', {
                    url: '/authentication',
                    templateUrl: '/modules/users/views/authentication/authentication.client.view.html'
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
                    templateUrl: '/modules/users/views/password/forgot-password.client.view.html'
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
                    templateUrl: '/modules/users/views/password/reset-password-invalid.client.view.html'
                }).

            /**
             * Password Reset - Success
             * @description Route if the password reset was successful
             */
                state('password.reset.success', {
                    url: '/success',
                    templateUrl: '/modules/users/views/password/reset-password-success.client.view.html'
                }).

            /**
             * Password Reset - Form
             * @description Route for resetting a password based on a form
             */
                state('password.reset.form', {
                    url: '/:token',
                    templateUrl: '/modules/users/views/password/reset-password.client.view.html'
                });
        }
    ]);


})();
