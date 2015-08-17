(function () {
    'use strict';

    angular
        .module('messages')
        .service('messageService', messageService);

    messageService.$inject = ['$http', 'settings'];

    function messageService ($http, settings) {

        return {
            getMessages : getMessages,
            createMessage: createMessage
        };

        function getMessages() {
            return $http.get(settings.messages);
        }

        function createMessage(message) {
            return $http.post(settings.messages, message);
        }

    }

})();
