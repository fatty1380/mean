(function () {
    'use strict';

    angular
        .module('messages')
        .controller('messagesCtrl', messagesCtrl);

    messagesCtrl.$inject = ['messageService', 'messageModalsService'];

    function messagesCtrl (messageService, messageModalsService) {

        var vm  = this;
        vm.messages = [];

        getMessages();

        vm.showNewMassageModal = function (parameters) {
            messageModalsService
                .showNewMassageModal(parameters)
                .then(function () {
                    getMessages();
                },
                function (err) {
                    console.log(err);
                })
        };

        function getMessages () {
            messageService
                .getMessages()
                .then(function (res) {
                    console.log('GET MESSAGES SUCCESS ----- >>>', res);
                    vm.messages = res.data;
                }, function (err) {
                    console.log('GET MESSAGES ERROR ----- >>>', err);
                });
        }

    }

})();
