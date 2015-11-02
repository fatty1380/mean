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
            friends: friends,
            users: users,
            loadFriends: loadFriends,
            retrieveFriends: retrieveFriends,
            getFriendStatus: getFriendStatus,
            getRequestsList: getRequestsList,
            createRequest: createRequest,
            loadRequest: loadRequest,
            updateRequest: updateRequest,
            sendRequests: sendFriendRequests
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
            if (!id) return;

            return $http.get(settings.friends + id);
        }

        function getRequestsList() {
            return $http.get(settings.requests);
        }

        function createRequest(requestData) {
            return $http.post(settings.requests, requestData);
        }

        function loadRequest(id) {
            if (!id) return;
            return $http.get(settings.friends + id);
        }

        function updateRequest(id, data) {
            if (!id) return;
            return $http.put(settings.requests + id, data);
        }
        
        ///////////////////////////////////////////////////////////////
        
        function sendFriendRequests(newInvites) {

            messageTemplate = '<ion-spinner /><br>Sending ' + newInvites.length + ' Invitations';
            $ionicLoading.show({ template: messageTemplate, duration: '5000' });

            var requestSentStatuses = [];
            var successfullySent;
            var messageTemplate;

            //TODO: remove requestSentStatuses array when there will be a possibility to send an array of users
            //TODO: and show the message in the success callback

            for (var i = 0; i < newInvites.length; i++) {
                var postData = { contactInfo: newInvites[i], text: '' },
                    serializedData = utilsService.serialize(postData);

                $http
                    .post(settings.requests, serializedData)
                    .then(function () {
                        requestSentStatuses.push(true);
                        if (i = newInvites.length) {
                            successfullySent = requestSentStatuses.indexOf(false) < 0;
                            deferred.resolve(successfullySent);
                        }
                    }, function (err) {
                        requestSentStatuses.push(false);
                    });
            }

            return promise.then(function (response) {
                if (response || true) {
                    messageTemplate = 'Invitations have been successfully sent';
                    $ionicLoading.show({ template: messageTemplate, duration: '1500' });
                }
            });
        }

    }

})();
