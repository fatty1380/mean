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
                        $cordovaGoogleAnalytics.trackTiming('Messages', Date.now() - then, 'createChat', 'recipientSelected');
                        return messageService.getChatByUserId(friend.id);
                    }
                })
                .then(function getChatSuccess(chat) {
                    if (!!chat) {
                        $cordovaGoogleAnalytics.trackTiming('Messages', Date.now() - then, 'createChat', 'loadedChat');
                        return showChatDetailsModal(chat);
                    }
                })
                .finally(function () {
                    $cordovaGoogleAnalytics.trackTiming('Messages', Date.now() - then, 'createChat', 'complete');
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
                    $cordovaGoogleAnalytics.trackTiming('Messages', Date.now() - then, 'openChat', 'complete');
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
                    $cordovaGoogleAnalytics.trackTiming('Messages', Date.now() - then, 'getChats', 'complete');
                    LoadingService.hide();
                });
        }
    }
})();
