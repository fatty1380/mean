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
            createUser: function (credentials) {
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
                    debugger;

                    var RSRC = $resource('api/profiles/:userId',
                        { userId: '@userId' });

                    return RSRC.get({ userId: driver.user }).$promise;
                }

                return deferred.promise;
            }

        };

        return _data;
    }

    function FriendService($resource, $log) {

        // Externally Accessible Members
        var service = {
            getRequests: listRequests,
            request: requestFriend,
            accept: acceptRequest,
            ignore: ignoreRequest,

            get: listFriends,
            check: checkFriend,
            remove: removeFriend
        };
        
        /// Local Vars
        var RootFriendRsrc = $resource('api/friends',
            {}, { update: { method: 'PUT' } });
            
        //var FriendStatusRsrc = $resource('api/friends/:userId');
        
        var FriendRequestRsrc = $resource('api/requests/:requestId',
            {requestId: '@_id'}, {
                update: { method: 'PUT' }
            });

        return service;
        
        ///////////////////////
            
        // GET /api/requests
        function listRequests(query) {
            return FriendRequestRsrc.query(query);
        }
        
        // POST /api/requests
        function requestFriend(friend) {
            var id = !!friend && friend.id || friend;

            debugger; // check ID
            var friendRequest = new FriendRequestRsrc({ friendId: id });

            return friendRequest.$save().then(
                function (success) {
                    $log.debug('created new friend request: %o', success);
                    return success;
                });

        }
        
        // PUT /api/requests/:requestId
        function acceptRequest(request) {
            debugger;
            return FriendRequestRsrc
            .update({ requestId: request.id || request._id}, {action: 'accept' }).$promise;
        }
        function ignoreRequest(request) {
            return FriendRequestRsrc
            .update({ requestId: request.id || request._id}, {action: 'deny' }).$promise;
        }
        
        // GET /api/friends
        function listFriends(query) {
            return RootFriendRsrc.query(query);
        }
        
        // GET /api/friends/:userId
        function checkFriend(user) {
            var id = !!user && user.id || user;
            
            return FriendRequestRsrc.query({userId: id}).$promise.then(
                function(results) {
                    $log.debug('Got Requests from server: %o', results);
                    return _.first(results);
                })
                .then(function(request) {
                    $log.debug('Returning first result %o', request);
                    
                    return request;
                });
        }
        
        // DELETE /api/friends/:userId
        function removeFriend(userId) {
            return FriendStatusRsrc.delete({ userId: userId });
        }
    }

    function seedService($resource) {
        return $resource('api/seed', {},
            {
                update: {
                    method: 'PUT'
                }
            });
    }


    UsersService.$inject = ['$resource', '$q'];
    FriendService.$inject = ['$resource', '$log'];
    NewUserService.$inject = ['Authentication', '$resource', '$log', '$http', '$q'];
    ProfilesService.$inject = ['$resource', '$q', '$log'];
    seedService.$inject = ['$resource'];

    angular
        .module('users')
        .factory('Users', UsersService)
        .factory('UserService', NewUserService)
        .factory('SeedService', seedService)
        .factory('Profiles', ProfilesService)
        .factory('Friends', FriendService);


})();
