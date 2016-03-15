(function() {
    'use strict';

    angular
        .module('signup')
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider

                .state('home', {
                    url: '/home',
                    cache: false,
                    templateUrl: 'modules/signup/templates/home.html',
                    controller: 'HomeCtrl as vm',
                    resolve: {
                        loginCheck: loginCheckAndRedirect
                    }
                })

                .state('login', {
                    url: '/login',
                    templateUrl: 'modules/signup/templates/login.html',
                    controller: 'LoginCtrl as vm'
                })

                .state('signup', {
                    url: '/signup',
                    templateUrl: 'modules/signup/templates/signup-base.html',
                    abstract: true
                    controller: 'SignupCtrl as vm',
                    parent: 'app'
                })

                /**
                 *  Signup User Flow:
                 *  1.  Register : Enter Email and Password
                 *  2.  Handle : Enter Name and CB
                 *  3.  CDL : Enter License Class
                 *  4.  CDL : Enter License Endorsements
                 *  5.  Miles : Enter Career Miles Driven
                 *  6.  Exp : Enter Years of Experience
                 *  7.  O/O : Are you an Owner Operator?
                 *  8.  Truck : Enter Truck Make/Mfg
                 *  9.  Trailer : Enter Trailer Experience
                 *  10. Pic : Select Profile Picture
                 *  11. Welcome : Congrats!!!
                 */

                // Register : State 0
                .state('signup.register', {
                    url: '/register',
                    templateUrl: 'modules/signup/templates/register.html',
                    controller: 'RegisterCtrl as vm',
                    resolve: {
                        wizard: function () {
                            return {
                                stepNum: 0,
                                nextState: 'signup.intro',
                                btnText: 'create my account',
                                noUser: true
                            };
                        }
                    }
                })


                // Intro : State 0a
                .state('signup.intro', {
                    url: '/intro',
                    templateUrl: 'modules/signup/templates/intro.html',
                    controller: 'IntroCtrl as vm',
                    resolve: {
                        wizard: function () {
                            return {
                                stepNum: 0,
                                nextState: 'signup.handle',
                                btnText: 'continue'
                            };
                        }
                    }
                })

                // Handle : State 1
                .state('signup.handle', {
                    url: '/handle',
                    templateUrl: 'modules/signup/templates/handle.html',
                    controller: 'HandleCtrl as vm',
                    resolve: {
                        wizard: function () {
                            return {
                                stepNum: 1,
                                nextState: 'signup.license',
                                btnText: 'continue'
                            };
                        }
                    }
                })

                // .state('signup.license-old', {
                //     url: '/license-old',
                //     templateUrl: 'modules/signup/templates/license-class.html',
                //     controller: 'LicenseCtrl as vm'
                // })

                // Handle : State 2
                .state('signup.license', {
                    url: '/license',
                    templateUrl: 'modules/signup/templates/circle-select.html',
                    controller: 'ClassCtrl as vm',
                    resolve: {
                        wizard: function () {
                            return {
                                stepNum: 2,
                                nextState: 'signup.endorsements',
                                btnText: 'continue'
                            };
                        }
                    }
                })

                // Handle : State 3
                .state('signup.endorsements', {
                    url: '/endorsements',
                    templateUrl: 'modules/signup/templates/endorsements.html',
                    controller: 'EndorsementCtrl as vm',
                    resolve: {
                        wizard: function () {
                            return {
                                stepNum: 3,
                                nextState: 'signup.miles',
                                btnText: 'continue'
                            };
                        }
                    }
                })

                // Handle : State 4
                .state('signup.miles', {
                    url: '/miles',
                    templateUrl: 'modules/signup/templates/circle-select.html',
                    controller: 'MilesCtrl as vm',
                    resolve: {
                        wizard: function () {
                            return {
                                stepNum: 4,
                                nextState: 'signup.years',
                                btnText: 'continue'
                            };
                        }
                    }
                })

                // Handle : State 5
                .state('signup.years', {
                    url: '/years',
                    templateUrl: 'modules/signup/templates/circle-select.html',
                    controller: 'YearsCtrl as vm',
                    resolve: {
                        wizard: function () {
                            return {
                                stepNum: 5,
                                nextState: 'signup.own-op',
                                btnText: 'continue'
                            };
                        }
                    }
                })

                // Handle : State 6
                .state('signup.own-op', {
                    url: '/own-op',
                    templateUrl: 'modules/signup/templates/circle-select.html',
                    controller: 'OwnOpCtrl as vm',
                    resolve: {
                        wizard: function () {
                            return {
                                stepNum: 6,
                                nextState: 'signup.trucks',
                                btnText: 'continue'
                            };
                        }
                    }
                })

                // Handle : State 7
                .state('signup.trucks', {
                    url: '/trucks',
                    templateUrl: 'modules/signup/templates/trucks.html',
                    controller: 'TrucksCtrl as vm',
                    resolve: {
                        wizard: function () {
                            return {
                                stepNum: 7,
                                nextState: 'signup.trailers',
                                btnText: 'continue'
                            };
                        }
                    }
                })

                // Handle : State 8
                .state('signup.trailers', {
                    url: '/trailers',
                    templateUrl: 'modules/signup/templates/trailers.html',
                    controller: 'TrailersCtrl as vm',
                    resolve: {
                        wizard: function () {
                            return {
                                stepNum: 8,
                                nextState: 'signup.photo',
                                btnText: 'continue'
                            };
                        }
                    }
                })

                // Handle : State 9
                .state('signup.photo', {
                    url: '/photo',
                    templateUrl: 'modules/signup/templates/photo.html',
                    controller: 'PhotoCtrl as vm',
                    resolve: {
                        wizard: function () {
                            return {
                                stepNum: 9,
                                nextState: 'signup.intro',
                                btnText: 'continue'
                            };
                        }
                    }
                })

                // Intro : State 0a
                .state('signup.complete', {
                    url: '/complete',
                    templateUrl: 'modules/signup/templates/intro.html',
                    controller: 'CompleteCtrl as vm',
                    resolve: {
                        wizard: function () {
                            return {
                                stepNum: 0,
                                nextState: 'account.profile',
                                btnText: 'continue'
                            };
                        }
                    }
                })

                .state('signup.friends', {
                    url: '/friends',
                    templateUrl: 'modules/signup/templates/friends.html',
                    controller: 'SignupFriendsCtrl as vm'
                })

                .state('signup.friends-contacts', {
                    url: '/contacts',
                    templateUrl: 'modules/signup/templates/add-friends-from-contacts.html',
                    controller: 'AddContactFriendsCtrl as vm',
                    params: {
                        resolveContacts: false
                    },
                    resolve: {
                        contacts: function($stateParams, contactsService, LoadingService) {
                            return contactsService.loadOrResolveContacts($stateParams.resolveContacts);
                        }
                    }
                })

                .state('signup.friends-manually', {
                    url: '/manually',
                    templateUrl: 'modules/signup/templates/add-friend-manually.html',
                    controller: 'AddFriendManuallyCtrl as vm'
                });

        }]);


    /**
     * @desc check user logged in
    */
    loginCheckAndRedirect.$inject = ['$q', 'userService', '$state', 'tokenService', 'registerService', 'securityService'];
    function loginCheckAndRedirect($q, userService, $state, tokenService, registerService, securityService) {
        if (tokenService.get('access_token')) {
            return registerService.me()
                .then(function(response) {
                    if (response && response.success) {
                        if (response.message.data) {
                            securityService.initialize();
                            $state.go('account.profile');
                            return true;
                        }
                    } else {
                        if (response && response.status == 401) {
                            tokenService.set('access_token', '');
                        }
                    }
                    return false;
                })
                .catch(function(err) {
                    logger.error('Failed to load `me`', err);
                    return false;
                });
        } else {
            return $q.when(false);
        }
    }
})();
