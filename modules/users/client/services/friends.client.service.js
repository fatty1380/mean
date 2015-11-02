(function () {
	'use strict';

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

        return service;
            
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

            return Requests.list({ userId: id }).then(
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
})();