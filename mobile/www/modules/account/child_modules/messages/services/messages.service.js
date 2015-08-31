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
            return $http.get(settings.chats + userId);
        }

        function getChats() {
            return $http.get(settings.chats);
        }

        function createMessage(message) {
            $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded;charset=utf-8";
            return $http.post(settings.messages, utilsService.serialize(message));
        }
    }
})();
