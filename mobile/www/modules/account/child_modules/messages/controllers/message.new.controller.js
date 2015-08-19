(function() {
    'use strict';

    angular
        .module('account')
        .controller('MessageNewCtrl', MessageNewCtrl);

    MessageNewCtrl.$inject = ['$scope', 'messageService'];

    function MessageNewCtrl($scope, messageService) {
        var vm = this;

        vm.cancel = function () {
            $scope.closeModal(null);
        };

        vm.createMessage = function () {
            if(!vm.message) return;

            var messageObj = {
                text: vm.message,
                recipient: "55b27b1893e595310272f1d0"
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
