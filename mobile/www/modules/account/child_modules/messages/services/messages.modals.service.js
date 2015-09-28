(function () {
    'use strict';

    angular
        .module('messages')
        .factory('messageModalsService', messageModalsService);

    messageModalsService.$inject = ['modalService'];

    function messageModalsService (modalService) {
        var templateUrl, controller, params;

        function showNewMessageModal (parameters) {
            templateUrl = 'modules/account/child_modules/messages/templates/message-chat-details.html';
            controller = 'MessageChatDetailsCtrl as vm';
            params = parameters || {};

            return modalService
                .show(templateUrl, controller, params)
        }

        /**
         * createNewChatModal
         * Opens up a list of the user's friedns, and allows them to select from the list.
         */
        function createNewChatModal (parameters) {
            templateUrl = 'modules/account/child_modules/messages/templates/message-friends.html';
            controller = 'MessageFriendCtrl as vm';
            params = parameters || {};

            return modalService
                .show(templateUrl, controller, params)
        }

        return {
            showNewMessageModal: showNewMessageModal,
            createNewChatModal: createNewChatModal
        };

    }

})();
