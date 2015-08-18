(function () {
    'use strict';

    angular
        .module('messages')
        .controller('MessagesCtrl', MessagesCtrl);

    MessagesCtrl.$inject = ['messageService', 'messageModalsService'];

    function MessagesCtrl (messageService, messageModalsService) {

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
