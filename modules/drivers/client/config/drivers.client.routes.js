(function () {
    'use strict';

    function handle404s(err) {
        // recover here if err is 404
        if (err.status === 404) {
            console.warn('No Driver found ... resolving as null', err);
            return null;
        } //returning recovery

        console.error('Hard Error when retrieiving Driver', err);
        // otherwise return a $q.reject
        throw err;
    }

    driverResolve.$inject = ['Drivers', '$stateParams'];
    function driverResolve(Drivers, params) {
        if (!!params.driverId) {
            console.log('Searching for driver ID: %s', params.driverId);
            return Drivers.get(params.driverId);
        }
        return Drivers.default;
    }

    userResolve.$inject = ['Drivers', '$stateParams', 'Authentication'];
    function userResolve(Drivers, params, auth) {
        var val;
        if (!!params.userId) {
            val = params.userId;
            console.log('Searching for driver data for user %s', val);
        } else {
            val = auth.user._id;
            console.log('Searching for driver data for logged in user: %s', val);
        }

        var driver = Drivers.getByUser(val);

        return driver.catch(handle404s);
    }

    driverListResolve.$inject = ['Drivers', '$log'];
    function driverListResolve(Drivers, $log) {
        return Drivers.ById.query().$promise
            .catch(function (err) {
                $log.error('Unable to load drivers list due to error', err);
                return [];
            });
    }


    /// TODO: This is a dupe of users.client.routes resolver
    var upcResolve = {
        user: ['Authentication', 'LoginService', function resolveUser(Authentication, LoginService) {
            return LoginService.getUser().then(
                function success(user) {

                    if (!Authentication.user) {
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
            return profile && !!profile.company ? Companies.get(profile.company) : null;
        }]
    };
            
    // Dependency Injection
    config.$inject = ['$stateProvider'];
    function config($stateProvider) {
        
            

        // Drivers state routing
        $stateProvider.

        /** ==== Truckerline Base ==================================================
         * Serves as a base route for visible truckerline profile viewing...
         * 
         * At the root will be the driver's profile card, with sub-states containing
         * things like documents and reviews dependent on permissions.
         */

            state('trucker', {
                url: '/trucker/:userId',
                templateUrl: '/modules/drivers/views/trucker.client.view.html',
                controller: 'TruckerViewCtrl',
                controllerAs: 'vm',
                bindToController: true,
                resolve: upcResolve,
                params: {
                    userId: {
                        value: null,
                        squash: true
                    }
                }
            }).
            state('trucker.experience', {
                url: '/experience',
                template: '<oset-experience-list list="vm.profile.experience"></oset-experience-list>'
            }).
            state('trucker.review', {
                url: '/review',
                params: {
                    requestId: {
                        value: null,
                        squash: true
                    }
                },
                onEnter: ['$log', '$stateParams', '$state', function ($log, $stateParams, $state) {
                    $state.go('reviews.create', { requestId: $stateParams.requestId });
                }],
            }).
            state('trucker.reviews', {
                url: '/reviews',
                controller: 'TruckerReviewListCtrl',
                controllerAs: 'vm',
                resolve: {
                    reviews: ['$log', 'Reviews', 'profile', function ($log, Reviews, profile) {
                        return Reviews.ByUser.query({ userId: profile.id });
                    }]
                },
                templateUrl: '/modules/drivers/views/trucker-reviews.client.view.html',
            }).
            state('trucker.documents', {
                url: '/documents',
                controller: 'TruckerLockboxCtrl',
                controllerAs: 'vm',
                resolve: {
                    documents: ['$log', 'Documents', 'profile', function ($log, Documents, profile) {
                        return Documents.byUser.query({ userId: profile.id }).$promise
                            .catch(function reject(err) {
                                $log.error('Unable to Fetch User\'s documents', err);

                                return null;
                            });
                    }]
                },
                templateUrl: '/modules/drivers/views/trucker-docs.client.view.html',
            }).
            
        /** ==== TRUCKERLINE BASE : END =========================================== */

            state('drivers', {
                abstract: true,
                url: '/drivers',
                template: '<div ui-view class="content-section"></div>',
                parent: 'fixed-opaque'
            }).

            state('drivers.list', {
                url: '',
                templateUrl: '/modules/drivers/views/list-drivers.client.view.html',
                parent: 'drivers',
                resolve: {
                    drivers: driverListResolve
                },
                controller: 'DriversListController',
                controllerAs: 'vm',
                bindToController: true
            }).

            state('drivers.create', {
                url: '/create',
                templateUrl: '/modules/drivers/views/edit-driver.client.view.html',
                parent: 'drivers',
                resolve: {
                    driver: userResolve
                },
                controller: 'DriverEditController',
                controllerAs: 'vm',
                bindToController: true
            }).

        // state('drivers.home', {
        //     url: '/home',
        //     templateUrl: '/modules/drivers/views/view-driver.client.view.html',
        //     parent: 'drivers',
        //     controller: 'DriverViewController',
        //     controllerAs: 'vm',
        //     bindToController: true,
        //     resolve: {
        //         driver: userResolve
        //     },
        //     authenticate: true
        // }).

        //state('drivers.view', {
        //    url: '/{userId:[0-9a-fA-F]{24}}',
        //    templateUrl: '/modules/drivers/views/view-driver.client.view.html',
        //    parent: 'drivers',
        //    resolve: {
        //        driver: ['Drivers', '$stateParams', function(Drivers, $stateParams) {
        //                return Drivers.ByUser.get({
        //                    userId: $stateParams.userId
        //                }).$promise;
        //            }]
        //    },
        //    controller: 'DriverViewController',
        //    controllerAs: 'vm',
        //    bindToController: true
        //}).

            state('drivers.edit', {
                url: '/{driverId:[0-9a-fA-F]{24}}/edit',
                templateUrl: '/modules/drivers/views/edit-driver.client.view.html',
                parent: 'drivers',
                resolve: {
                    driver: driverResolve
                },
                controller: 'DriverEditController',
                controllerAs: 'vm',
                bindToController: true
            }).

            state('drivers.documents', {
                url: '/{driverId:[0-9a-fA-F]{24}}/reports/:documentId',
                templateUrl: '/modules/drivers/views/document-viewer.client.view.html',
                parent: 'drivers',
                resolve: {
                    driver: driverResolve
                },
                controller: 'DocumentViewController',
                controllerAs: 'vm',
                bindToController: true
            });
    }


    //Setting up route
    angular.module('drivers').config(config);
})();
