(function () {
    'use strict';

    angular
        .module('profile')
        .factory('friendsService', friendsService);

    friendsService.$inject = ['$http', 'settings'];

    function friendsService($http, settings) {
        var friends = [], users = [];

        return {
            getFriends: getFriends,
            getUsers: getUsers,
            setFriends: setFriends,
            friends : friends,
            users : users,
            loadFriends: loadFriends,
            retrieveFriends: retrieveFriends,
            getFriendStatus: getFriendStatus,
            getRequestsList: getRequestsList,
            createRequest: createRequest,
            loadRequest: loadRequest,
            updateRequest: updateRequest
        };

        function getFriends() {
            return friends;
        }

        function setFriends(userFriends) {
            friends = userFriends;

            return friends;
        }

        function getUsers() {
            return users;
        }

        function retrieveFriends() {
            return $http.get(settings.friends).then(
                function success(response) {
                    setFriends(response.data);
                    
                    return response.data;
                });
        }

        function loadFriends(id) {
            if (!id) {
                return retrieveFriends();
            }

            return $http.get(settings.users + id + '/friends').then(
                function success(response) {
                    setFriends(response.data);
                    
                    return response.data;
                });
        }

        function getFriendStatus(id) {
            if(!id) return;

            return $http.get(settings.friends + id);
        }

        function getRequestsList() {
            return $http.get(settings.requests);
        }

        function createRequest(requestData) {
            return $http.post(settings.requests, requestData);
        }

        function loadRequest(id) {
            if(!id) return;
            return $http.get(settings.friends + id);
        }

        function updateRequest(id, data) {
            if(!id) return;
            return $http.put(settings.requests + id, data);
        }

    }

})();
