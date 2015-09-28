(function() {
    'use strict';

    angular
        .module('account')
        .controller('MessageChatDetailsCtrl', MessageChatDetailsCtrl);

    MessageChatDetailsCtrl.$inject = ['$state', '$scope', 'updateService', 'messageService', 'parameters', '$ionicScrollDelegate', '$timeout', '$ionicLoading', 'utilsService', 'settings'];

    function MessageChatDetailsCtrl($state, $scope, updateService, messageService, parameters, $ionicScrollDelegate, $timeout, $ionicLoading, utilsService, settings) {
        var vm = this;
        vm.message = '';
        vm.messages = (parameters.messages || []).reverse();
        vm.profileData = null;
        
        vm.recipientId = parameters.recipient.id || parameters.recipient;
        vm.recipientName = parameters.recipientName || parameters.recipient && parameters.recipient.handle ||  parameters.recipient && parameters.recipient.firstName;

        vm.viewUser = viewUser;
        vm.close  = close;
        vm.createMessage  = createMessage;

        updateService.resetUpdates('messages', vm.recipientId);

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
            };

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
        
        function viewUser(e) {
            console.log('Routing to User Profile Page for `%s`', vm.recipientName);
            vm.closeModal(null);
            $state.go('account.profile', { userId: vm.recipientId });
        }
    }
})();
