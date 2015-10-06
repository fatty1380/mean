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
        .factory('Requests', RequestsService);

    RequestsService.$inject = ['$resource', '$log'];
    function RequestsService($resource, $log) {
        var service = {
            create: createRequest,
            list: listRequests,
            get: getRequest,
            update: updateRequest
        };

        var RequestMsgRsrc = $resource('api/requests/:requestId',
            { requestId: '@_id' }, {
                update: { method: 'PUT' }
            });

        return service;
        
        ///////////////////////////////////////////
        
        // POST /api/requests
        function createRequest(obj) {
            var request = new RequestMsgRsrc(obj);

            return request.$save().then(
                function (success) {
                    $log.debug('created new friend request: %o', success);
                    return success;
                });
        }
        
        // GET /api/requests
        function listRequests(query) {
            return RequestMsgRsrc.query(query).$promise;
        }

        // GET /api/requests/:requestId
        function getRequest(id) {
            return RequestMsgRsrc.get({ requestId: id }).$promise;
        }
        
        function updateRequest(id, data) {
            return RequestMsgRsrc.update(id, data).$promise;
        }
        
        /////////////////////////////////
        
    }
    
    ////////////////////////////////////////////////////////////////////////////////////

    angular
        .module('users')
        .factory('Friends', FriendService);
    FriendService.$inject = ['$resource', '$log', 'Requests'];
    function FriendService($resource, $log, Requests) {

        // Externally Accessible Members
        var service = {
            getRequests: listRequests,
            request: requestFriend,
            accept: acceptRequest,
            ignore: ignoreRequest,

            query: listFriends,
            check: checkFriend,
            remove: removeFriend
        };
        
        /// Local Vars
        var RootFriendRsrc = $resource('api/friends/:userId',
            {}, { update: { method: 'PUT' } });
            
        //var FriendStatusRsrc = $resource('api/friends/:userId');
        
        // POST /api/requests
        function requestFriend(friend) {
            var id = !!friend && friend.id || friend;

            debugger; // check ID
            
            Requests.create({ friendId: id, requestType: 'friendRequest' })
                .then(
                    function (success) {
                        $log.debug('created new friend request: %o', success);
                        return success;
                    });

        }
        
        function listRequests() {
            return Requests.list({ requestType: 'friendRequest' });
        }
        function acceptRequest(request) {
            debugger;
            return Requests
                .update({ requestId: request.id || request._id }, { action: 'accept' });
        }
        function ignoreRequest(request) {
            return Requests
                .update({ requestId: request.id || request._id }, { action: 'deny' });
        }
        
        // GET /api/friends
        function listFriends(query) {
            return RootFriendRsrc.query(query).$promise;
        }
        
        // GET /api/friends/:userId
        function checkFriend(user) {
            var id = !!user && user.id || user;

            return Requests.query({ userId: id }).then(
                function (results) {
                    $log.debug('Got Requests from server: %o', results);
                    return _.first(results);
                })
                .then(function (request) {
                    $log.debug('Returning first result %o', request);

                    return request;
                });
        }
        
        // DELETE /api/friends/:userId
        function removeFriend(userId) {
            debugger; // TODO: Test and determine if needed
            return RootFriendRsrc.delete({ userId: userId });
        }
    }
    
    ////////////////////////////////////////////////////////////////////////////////////

    angular
        .module('users')
        .factory('SeedService', seedService);

    seedService.$inject = ['$resource'];
    function seedService($resource) {
        return $resource('api/seed', {},
            {
                update: {
                    method: 'PUT'
                }
            });
    }



})();
