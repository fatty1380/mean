(function () {
    'use strict';

    angular
        .module('messages')
        .controller('MessagesCtrl', MessagesCtrl);

    MessagesCtrl.$inject = ['$rootScope', 'updates', 'updateService', '$scope', 'messageService', 'messageModalsService', 'LoadingService', 'friendsService', 'recipientChat'];

    function MessagesCtrl($rootScope, updates, updateService, $scope, messageService, messageModalsService, LoadingService, friendsService, recipientChat) {

        var vm = this;
        vm.messages = [];
        vm.chats = [];
        vm.updates = updates || updateService.getLastUpdates();

        vm.showChatDetailsModal = showChatDetailsModal;
        vm.createNewChat = createNewChat;
        vm.getChats = getChats;

        $rootScope.$on("clear", function () {
            logger.debug('MessagesCtrl clear');
            vm.messages = [];
            vm.chats = [];
        });

        $scope.$on('$ionicView.enter', function () {
            if (!!recipientChat) {
                showChatDetailsModal(recipientChat);
            } else {
                getChats();
            }
        });

        function createNewChat() {
            friendsService
                .retrieveFriends()
                .then(function retrieveFriendsSuccess(friends) {
                    return messageModalsService
                        .selectChatRecipient({ friends: friends });
                })
                .then(function selectedChatRecipientSuccess(friend) {
                    if(!!friend) return messageService.getChatByUserId(friend.id);
                })
                .then(function getChatSuccess(chat) {
                    if(!!chat) showChatDetailsModal(chat);
                });
        }

        function loadProfileAvatars() {

        }

        function showChatDetailsModal(chat) {
            logger.debug('showChatDetailsModal() ', chat);
            messageModalsService
                .showNewMessageModal(chat)
                .then(function messageModalSuccess() {
                    getChats();
                })
                .catch(function messageModalFailure(err) {
                    logger.error('Messages.showChatDetails failed', err);
                });
        }

        function getChats() {
            LoadingService.showLoader('Loading');
            messageService
                .getChats()
                .then(function (res) {
                    logger.debug('GET CHATS SUCCESS ----- >>>', res);
                    vm.chats = res.data;
                    loadProfileAvatars();
                }, function (err) {
                    logger.error('GET CHATS ERROR ----- >>>', err);
                })
                .finally(function () {
                    LoadingService.hide();
                });
        }
    }
})();
