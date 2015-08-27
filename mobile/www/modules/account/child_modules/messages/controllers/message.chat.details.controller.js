(function() {
    'use strict';

    angular
        .module('account')
        .controller('MessageChatDetailsCtrl', MessageChatDetailsCtrl);

    MessageChatDetailsCtrl.$inject = ['$scope', 'messageService', 'parameters', '$ionicScrollDelegate', '$timeout', '$ionicLoading'];

    function MessageChatDetailsCtrl($scope, messageService, parameters, $ionicScrollDelegate, $timeout, $ionicLoading) {
        var vm = this;
        vm.message = '';
        vm.messages = parameters.messages.reverse();
        vm.recipientName = parameters.recipientName;
        vm.profileData = null;

        vm.close  = close;
        vm.createMessage  = createMessage;

        scrollToBottom();

       /* (function tick() {
            $scope.data = Data.query(function(){
                $timeout(tick, 1000);
            });
        })();*/

        function scrollToBottom() {
            $timeout(function(){
                getDelegate('mainScroll').scrollBottom();
            }, 100);
        }

        //fix for scrollDelegate in modals
        function getDelegate(name){
            var instances = $ionicScrollDelegate.$getByHandle(name)._instances;
            return instances.filter(function(element) {
                return (element['$$delegateHandle'] == name);
            })[0];
        }

        function close() {
            $scope.closeModal(null);
        };

        function createMessage() {
            if(!vm.message) return;

            var messageObj = {
                text: vm.message,
                recipient: parameters.recipient
                //recipient: "55b27b1893e595310272f1d0"  //Sergey Rykov
               // recipient: "55a8c832f58ef0900b7ca14c"  //test@test
               // recipient: "55a5317e4cec3d4a40d4bfa9"  //markov.flash
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
                    res.data.direction = 'outbound';
                    vm.messages.push(res.data);
                    scrollToBottom();
                }, function (err) {
                    $ionicLoading.hide();
                    console.log('MESSAGES WASN\'T CREATED ERROR ----- >>>', err);
                });
        }
    }
})();
