(function () {
    'use strict';

    // Users service used for communicating with the users REST endpoint

    angular
        .module('users')
        .factory('Users', UsersService);

    UsersService.$inject = ['$resource', '$q'];
    function UsersService($resource) {
        return $resource('api/users', {}, {
            update: {
                method: 'PUT'
            }
        });
    }
    
    ////////////////////////////////////////////////////////////////////////////////////

    angular
        .module('users')
        .factory('UserService', NewUserService);

    NewUserService.$inject = ['Authentication', '$resource', '$log', '$http', '$q'];
    function NewUserService(auth, $resource, $log, $http, $q) {
        var vm = this;
        vm.auth = auth;

        return {
            createUser: function (credentials) {
                var deferred = $q.defer();

                $log.debug('assigning email to username');
                credentials.username = credentials.email;

                $http.post('api/auth/signup', credentials)
                    .success(function (response) {

                        $log.debug('Successfully created %o USER Profile', response.type);

                        // If successful we assign the response to the global user model
                        vm.auth.user = response;

                        Raygun.setUser(vm.auth.user._id, false, vm.auth.user.email, vm.auth.user.displayName);

                        deferred.resolve(response);

                    }).error(function (response) {
                        $log.error('[UserService.createUser] Error creating user: %o', response);
                        deferred.reject(response.message);
                    });

                return deferred.promise;
            }
        };
    }
    
    ////////////////////////////////////////////////////////////////////////////////////
    
    angular
        .module('users')
        .factory('Profiles', ProfilesService);

    ProfilesService.$inject = ['$resource', '$q', '$log'];
    function ProfilesService($resource, $q, $log) {
        var _data = {
            query: function (query) {
                return $resource('api/profiles').query(query).$promise;
            },
            load: function (userId) {
                return $resource('api/profiles/:userId', {
                    userId: '@userId'
                }).get({ userId: userId }).$promise;
            },
            getUserForDriver: function (driver) {
                var deferred = $q.defer();

                if (_.isObject(driver.user) && !!driver.user._id) {
                    deferred.resolve(driver);
                } else {

                    var RSRC = $resource('api/profiles/:userId',
                        { userId: '@userId' });

                    return RSRC.get({ userId: driver.user }).$promise;
                }

                return deferred.promise;
            },

            lookup: function (user) {
                if (_.isString(user)) {
                    return _data.load(user);
                }
                return $q.when(user);
            }

        };

        return _data;
    }
    
    ////////////////////////////////////////////////////////////////////////////////////

    angular
        .module('users')
        .factory('SeedService', SeedService);

    SeedService.$inject = ['$resource'];
    function SeedService($resource) {
        return $resource('api/seed', {},
            {
                update: {
                    method: 'PUT'
                }
            });
    }



})();
