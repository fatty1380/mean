(function () {
    'use strict';

// Users service used for communicating with the users REST endpoint

    function UsersService($resource) {
        return $resource('api/users', {}, {
            update: {
                method: 'PUT'
            }
        });
    }

    function NewUserService(auth, $resource, $log, $http, $q) {
        var vm = this;
        vm.auth = auth;

        return {
            createUser : function(credentials) {
                var deferred = $q.defer();

                $log.debug('assigning email to username');
                credentials.username = credentials.email;

                $http.post('/api/auth/signup', credentials)
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


    function ProfilesService($resource, $q) {

        var _data = {
            query: function(query) {
                return $resource('api/profiles', {},{}).query(query).$promise;
            },
            get: function(userId) {
                return $resource('api/profiles/:userId', {
                    userId: '@userId'
                }, {}).get({userId: userId}).$promise;
            },
            getUserForDriver : function(driver) {
                var deferred = $q.defer;

                if(_.isObject(driver.user) && !!driver.user._id) {
                    deferred.resolve(driver);
                } else {
                    debugger;

                    var RSRC = $resource('api/profiles/:userId',
                        {userId: '@userId'});

                    return RSRC.get({userId: driver.user }).$promise;
                }

                return deferred.promise;
            }

        };

        return _data;
    }


    UsersService.$inject = ['$resource', '$q'];
    NewUserService.$inject = ['Authentication', '$resource', '$log', '$http', '$q'];
    ProfilesService.$inject = ['$resource'];

    angular
        .module('users')
        .factory('Users', UsersService)
        .factory('UserService', NewUserService)
        .factory('Profiles', ProfilesService);


})();
