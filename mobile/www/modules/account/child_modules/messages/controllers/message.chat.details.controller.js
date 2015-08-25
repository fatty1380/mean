(function() {
    'use strict';

    angular
        .module('account')
        .controller('MessageChatDetailsCtrl', MessageChatDetailsCtrl);

    MessageChatDetailsCtrl.$inject = ['$scope', 'messageService', 'parameters'];

    function MessageChatDetailsCtrl($scope, messageService, parameters) {
        var vm = this;

        vm.messages = parameters;

        vm.cancel = function () {
            $scope.closeModal(null);
        };


        vm.createMessage = function () {
            if(!vm.message) return;

            var messageObj = {
                text: vm.message,
                //recipient: "55b27b1893e595310272f1d0"  //Sergey Rykov
                recipient: "55a8c832f58ef0900b7ca14c"  //test@test
               // recipient: "55a5317e4cec3d4a40d4bfa9"  //markov.flash
            };

            messageService
                .createMessage(messageObj)
                .then(function (res) {
                    console.log('MESSAGE CREATED SUCCESS ----- >>>', res);
                    vm.cancel();
                }, function (err) {
                    console.log('MESSAGES WASN\'T CREATED ERROR ----- >>>', err);
                });
        }
    }

})();
