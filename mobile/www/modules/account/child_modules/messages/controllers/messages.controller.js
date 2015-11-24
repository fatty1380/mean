(function () {
    'use strict';

    angular
        .module('messages')
        .controller('MessagesCtrl', MessagesCtrl);

    MessagesCtrl.$inject = ['$rootScope', '$scope', 'updates', 'updateService', '$cordovaGoogleAnalytics',
        'messageService', 'messageModalsService', 'LoadingService', 'friendsService', 'recipientChat'];

    function MessagesCtrl($rootScope, $scope, updates, updateService, $cordovaGoogleAnalytics,
        messageService, messageModalsService, LoadingService, friendsService, recipientChat) {

        var vm = this;
        vm.messages = [];
        vm.chats = [];
        vm.updates = updates || updateService.getLastUpdates();

        vm.showChatDetailsModal = showChatDetailsModal;
        vm.createNewChat = createNewChat;
        vm.getChats = getChats;

        $rootScope.$on("clear", function () {
            $cordovaGoogleAnalytics.trackEvent('Messages', 'clear', null, vm.chats.length);
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
            $cordovaGoogleAnalytics.trackEvent('Messages', 'createChat', 'start');
            var then = Date.now();

            friendsService
                .retrieveFriends()
                .then(function retrieveFriendsSuccess(friends) {
                    return messageModalsService
                        .selectChatRecipient({ friends: friends });
                })
                .then(function selectedChatRecipientSuccess(friend) {
                    if (!!friend) {
                        $cordovaGoogleAnalytics.trackEvent('Messages', 'createChat', 'recipientSelected', Date.now() - then);
                        return messageService.getChatByUserId(friend.id);
                    }
                })
                .then(function getChatSuccess(chat) {
                    if (!!chat) {
                        $cordovaGoogleAnalytics.trackEvent('Messages', 'createChat', 'loadedChat', Date.now() - then);
                        return showChatDetailsModal(chat);
                    }
                })
                .finally(function () {
                    $cordovaGoogleAnalytics.trackEvent('Messages', 'createChat', 'complete', Date.now() - then);
                });
        }

        function loadProfileAvatars() {

        }

        function showChatDetailsModal(chat) {
            $cordovaGoogleAnalytics.trackEvent('Messages', 'openChat', 'start');
            var then = Date.now();

            logger.debug('showChatDetailsModal() ', chat);
            messageModalsService
                .showNewMessageModal(chat)
                .then(function messageModalSuccess() {
                    getChats();
                })
                .catch(function messageModalFailure(err) {
                    logger.error('Messages.showChatDetails failed', err);
                })
                .finally(function () {
                    $cordovaGoogleAnalytics.trackEvent('Messages', 'openChat', 'complete', Date.now() - then);
                });
        }

        function getChats() {
            var then = Date.now();

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
                    $cordovaGoogleAnalytics.trackEvent('Messages', 'getChats', 'complete', Date.now() - then);
                    LoadingService.hide();
                });
        }
    }
})();
