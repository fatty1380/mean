(function() {
    'use strict';

    angular
        .module('account')
        .controller('ProfileFriendMessageCtrl', ProfileFriendMessageCtrl)

    ProfileFriendMessageCtrl.$inject = ['$scope', 'messageService', 'parameters', '$ionicLoading'];

    function ProfileFriendMessageCtrl($scope, messageService, parameters, $ionicLoading) {
        var vm = this;
        vm.message = '';
        vm.recipientName = parameters.recipientName;

        vm.close  = close;
        vm.createMessage  = createMessage;

        function close() {
            $scope.closeModal(null);
        }

        function createMessage() {
            if(!vm.message) return;

            var messageObj = {
                text: vm.message,
                recipient: parameters.id
            };

            $ionicLoading.show({
                template: 'sending message'
            });

            messageService
                .createMessage(messageObj)
                .then(function (res) {
                    $ionicLoading.hide();
                    console.log('MESSAGE CREATED SUCCESS ----- >>>', res);
                    vm.message = '';
                    close();
                }, function (err) {
                    $ionicLoading.hide();
                    console.log('MESSAGES WASN\'T CREATED ERROR ----- >>>', err);
                });
        }
    }
})();
