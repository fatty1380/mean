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
            getFriendsForSpecificUser: getFriendsForSpecificUser,
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

        function getUsers() {
            return users;
        }

        function retrieveFriends() {
            return $http.get(settings.friends);
        }

        function setFriends(userFriends) {
            console.warn(' userFriends --->>>', userFriends);
            friends = userFriends;

            return friends;
        }

        function getFriendsForSpecificUser(id) {
            if(!id) return;

            return $http.get(settings.users + id + '/friends');
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
