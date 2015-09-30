(function () {
    'use strict';

    angular
        .module('messages')
        .factory('messageModalsService', messageModalsService);

    messageModalsService.$inject = ['modalService'];

    function messageModalsService (modalService) {
        var templateUrl, controller, params;

        return {
            showNewMessageModal: showNewMessageModal,
            selectChatRecipient: selectChatRecipient
        };

        /**
         * selectChatRecipient
         * Opens up a list of the user's friedns, and allows them to select from the list.
         * 
         * This is Step #1 in selecting 
         */
        function selectChatRecipient (parameters) {
            templateUrl = 'modules/account/child_modules/messages/templates/message-friends.html';
            controller = 'MessageFriendCtrl as vm';
            params = parameters || {};

            return modalService
                .show(templateUrl, controller, params)
        }
        
        function showNewMessageModal (parameters) {
            templateUrl = 'modules/account/child_modules/messages/templates/message-chat-details.html';
            controller = 'MessageChatDetailsCtrl as vm';
            params = parameters || {};

            return modalService
                .show(templateUrl, controller, params)
        }

    }

})();
