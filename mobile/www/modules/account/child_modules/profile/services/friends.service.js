(function () {
    'use strict';

    angular
        .module('profile')
        .factory('friendsService', friendsService);

    friendsService.$inject = ['$http', '$q', 'settings'];

    function friendsService ($http, $q, settings) {
        var friends = [];
        var users = [];

        return {
            getFriends: getFriends,
            getUsers: getUsers,
            setFriends: setFriends,
            friends: friends,
            users: users,
            loadFriends: loadFriends,
            retrieveFriends: retrieveFriends,
            getFriendStatus: getFriendStatus,
            getRequestsList: getRequestsList,
            getInviteStatus: getInviteStatus,
            sendFriendRequests: sendFriendRequests,
            createRequest: createRequest,
            loadRequest: loadRequest,
            updateRequest: updateRequest
        };

        function getFriends () {
            return friends;
        }

        function setFriends (userFriends) {
            friends = userFriends;

            return friends;
        }

        function getUsers () {
            return users;
        }

        function retrieveFriends () {
            return $http.get(settings.friends).then(
                function success (response) {
                    setFriends(response.data);

                    return response.data;
                });
        }

        function loadFriends (id) {
            if (!id) {
                return retrieveFriends();
            }

            return $http.get(settings.users + id + '/friends').then(
                function success (response) {
                    setFriends(response.data);

                    return response.data;
                });
        }

        function getFriendStatus (id) {
            if (!id) { return $q.reject('No ID Specified'); }

            return $http.get(settings.friends + id);
        }

        function getRequestsList () {
            return $http.get(settings.requests);
        }

        function getInviteStatus () {
            return $http.get(settings.requests, {
                params: {
                    sentRequests: true,
                    requestType: ['friendRequest'],
                    promoCheck: true
                }
            });
        }

        function sendFriendRequests (recipients) {
            var promises = _.map(recipients, function (recipient) {
                return createRequest({ contactInfo: recipient });
            });

            return $q.all(promises)
                .then(function success (results) {
                    logger.debug('Sent %d  new Requests');
                    return results;
                })
                .catch(function fail (err) {
                    logger.error(err, 'Failed to send requests');
                    throw err;
                });
        }

        function createRequest (requestData) {
            return $http.post(settings.requests, requestData);
        }

        function loadRequest (id) {
            if (!id) { return $q.reject('No ID Specified'); }
            return $http.get(settings.friends + id);
        }

        function updateRequest (id, data) {
            if (!id) { return $q.reject('No ID Specified'); }
            return $http.put(settings.requests + id, data);
        }

    }

})();
