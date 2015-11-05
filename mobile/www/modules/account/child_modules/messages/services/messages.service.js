(function () {
    'use strict';

    angular
        .module('messages')
        .service('messageService', messageService);

    messageService.$inject = ['$http', 'settings', 'utilsService'];

    function messageService ($http, settings, utilsService) {

        return {
            getMessages : getMessages,
            getChatByUserId : getChatByUserId,
            getChats : getChats,
            createMessage: createMessage
        };

        function getMessages() {
            return $http.get(settings.messages);
        }

        function getChatByUserId(userId) {
            return $http.get(settings.chats + userId)
                .then(function success(response) {
                    if (!!response.data) {
                        return response.data;
                    }
                });
        }

        function getChats() {
            return $http.get(settings.chats);
        }

        function createMessage(message) {
            return $http.post(settings.messages, message);
        }
    }
})();
