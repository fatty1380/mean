(function () {
    'use strict';

    angular
        .module('messages')
        .service('messageService', messageService);

    messageService.$inject = ['$http', 'settings'];

    function messageService ($http, settings) {

        return {
            getMessages : getMessages,
            getChats : getChats,
            createMessage: createMessage
        };

        function getMessages() {
            return $http.get(settings.messages);
        }

        function getChats() {
            return $http.get(settings.chats);
        }

        function createMessage(message) {
            return $http.post(settings.chats, message);
        }

    }

})();
