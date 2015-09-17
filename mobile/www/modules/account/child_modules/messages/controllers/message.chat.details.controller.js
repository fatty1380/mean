(function() {
    'use strict';

    angular
        .module('account')
        .controller('MessageChatDetailsCtrl', MessageChatDetailsCtrl)

    MessageChatDetailsCtrl.$inject = ['$state', 'messageService', 'parameters', '$ionicScrollDelegate', '$timeout', '$ionicLoading', 'utilsService', 'settings'];

    function MessageChatDetailsCtrl($state, messageService, parameters, $ionicScrollDelegate, $timeout, $ionicLoading, utilsService, settings) {
        var vm = this;
        vm.message = '';
        vm.messages = (parameters.messages || []).reverse();
        vm.recipientName = parameters.recipientName;
        vm.profileData = null;
        
        vm.recipientId = parameters.recipient.id || parameters.recipient;

        vm.close  = close;
        vm.createMessage  = createMessage;

        scrollToBottom();

        /**
         *  updating messages in chat, emulating socket
         * */
        utilsService.startClock(function() {
            messageService.getChatByUserId(parameters.recipient)
                .then(function(response) {
                    console.log(response.messages.length,' - ',vm.messages.length);
                    var messages = response.messages;
                    if(messages && messages.length > vm.messages.length) {
                        vm.messages = messages.reverse();
                        console.log('messages updated: ', vm.messages.length);
                        scrollToBottom();
                    }
                },function() {
                    console.log('messages update error ', vm.messages.length);
                });
        }, settings.messagesTimeout);

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
            //$state.go('.', { recipientId: undefined })
          //  $state.transitionTo($state.current.name, { recipientId: null }, { reload: false });
            utilsService.stopClock();
            vm.closeModal(null);
        }

        function createMessage() {
            if(!vm.message) return;

            var messageObj = {
                text: vm.message,
                recipient: parameters.recipient
                //recipient: "55b27b1893e595310272f1d0"  //Sergey Rykov
                //recipient: "55a8c832f58ef0900b7ca14c"  //test@test
               // recipient: "55a5317e4cec3d4a40d4bfa9"  //markov.flash
            };

            console.log('createMessage ',messageObj);

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
        
        // TODO : Move to common method
        function viewUser(e) {
            console.log('Routing to User Profile Page for `%s`', vm.recipientName);
            $state.go('account.profile.user', { userId: vm.recipientId });
        }
    }
})();
