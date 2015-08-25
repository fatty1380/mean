(function () {
    'use strict';

    angular
        .module('messages')
        .controller('MessagesCtrl', MessagesCtrl);

    MessagesCtrl.$inject = ['messageService', 'messageModalsService'];

    function MessagesCtrl (messageService, messageModalsService) {

        var vm  = this;
        vm.messages = [];
        vm.chats = [];

        vm.openChatDetails = openChatDetails;

        getChats();


        function openChatDetails(messages) {
            console.log('openChatDetails() ',messages);
            showChatDetailsModal(messages);
        }

        function showChatDetailsModal(parameters) {
            messageModalsService
                .showNewMassageModal(parameters)
                .then(function () {
                    //getMessages();
                },
                function (err) {
                    console.log(err);
                });
        };

       /* function getMessages () {
            messageService
                .getMessages()
                .then(function (res) {
                    console.log('GET MESSAGES SUCCESS ----- >>>', res);
                    vm.messages = res.data;
                }, function (err) {
                    console.log('GET MESSAGES ERROR ----- >>>', err);
                });
        }*/

        function getChats () {
            messageService
                .getChats()
                .then(function (res) {
                    console.log('GET CHATS SUCCESS ----- >>>', res);
                    vm.chats = res.data;
                }, function (err) {
                    console.log('GET CHATS ERROR ----- >>>', err);
                });
        }


    }

})();
