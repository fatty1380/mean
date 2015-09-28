(function () {
    'use strict';

    angular
        .module('messages')
        .controller('MessagesCtrl', MessagesCtrl);

    MessagesCtrl.$inject = ['$rootScope', 'updates', 'updateService', '$scope', 'messageService', 'messageModalsService', '$ionicLoading', 'friendsService', 'recipientChat'];

    function MessagesCtrl ($rootScope, updates, updateService, $scope, messageService, messageModalsService, $ionicLoading, friendsService, recipientChat) {

        var vm  = this;
        vm.messages = [];
        vm.chats = [];
        vm.updates = updates || updateService.getLastUpdates();

        vm.showChatDetailsModal = showChatDetailsModal;
        vm.createNewChat = createNewChat;
        vm.getChats = getChats;

        $rootScope.$on("clear", function () {
            console.log('MessagesCtrl clear');
            vm.messages = [];
            vm.chats = [];
        });

        $scope.$on('$ionicView.enter', function () {
            //updateService.resetUpdates('messages');
            debugger;

            if (!!recipientChat) {
                showChatDetailsModal(recipientChat);
            }else{
                getChats();
            }
        });

        function createNewChat () {
            friendsService
                .retrieveFriends()
                .then(function (friends) {
                    messageModalsService
                        .createNewChatModal({friends:friends})
                        .then(function (friend) {
                            messageService.getChatByUserId(friend.id)
                                .then(function (chat) {
                                    showChatDetailsModal(chat, friend.id)
                                });
                        })
                });
        }

        function loadProfileAvatars() {
            
        }

        function showChatDetailsModal(chat, recip) {
            debugger;
            console.log('showChatDetailsModal() ',chat);
            messageModalsService
                .showNewMessageModal({messages: chat, recipient: recip, })
                .then(function () {
                    getChats();
                },
                function (err) {
                    console.log(err);
                });
        }

        function getChats () {
            $ionicLoading.show({
                template: 'loading chats'
            });
            messageService
                .getChats()
                .then(function (res) {
                    $ionicLoading.hide();
                    console.log('GET CHATS SUCCESS ----- >>>', res);
                    vm.chats = res.data;
                    loadProfileAvatars();
                }, function (err) {
                    $ionicLoading.hide();
                    console.log('GET CHATS ERROR ----- >>>', err);
                });
        }
    }
})();
