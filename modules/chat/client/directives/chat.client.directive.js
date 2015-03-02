(function () {
    'use strict';

    function ChatDirective() {
        var ddo = {
            restrict: 'E',
            templateUrl: 'modules/chat/views/chat-console.client.template.html',
            controller: 'ChatClientController',
            controllerAs: 'vm',
            bindToController: true,
            scope: {
                connection: '=',
                messages: '=',
                room: '='
            }
        };

        return ddo;
    }

    function ChatClientController($scope, $log, Authentication, Socket) {
        var vm = this;

        /** Local Variables **/
        vm.auth = Authentication;
        vm.user = vm.auth.user;
        vm.username = vm.user && vm.user.username;

        vm.messageModes = ['text', 'multiline', 'html'];
        vm.messageMode = 'html';
        vm.activeConnection = false;

        vm.status = {
            me: null,
            them: null
        };

        vm.getStatusLabel = function(status) {
            switch(status) {
                case true: return 'label-success';
                case false: return 'label-warning';
                default: return 'label-default';
            }
        };

        vm.getSenderClass = function(username) {
            return username === vm.username ? 'me' : 'other';
        };


        var activate = function () {
            if (vm.user && vm.connection && vm.connection.isValid) {
                vm.activeConnection = true;
                $log.debug('creating socket for connection');
                vm.initSocket();
            }
            else {
                $log.debug('No connection, or invalid connection - not creating socket.');
            }
        };

        /** Chat Methods ------------------------------------------------ */
        vm.postMessage = function () {

            vm.error = null;

            if(!vm.message || !vm.room) {
                return false;
            }

            vm.sending = true;

            if (!!Socket) {
                var message = {
                    scope: 'applications',
                    text: vm.message,
                    room: vm.room
                };

                $log.debug('[AppCtrl.PostMessage] Emitting Message');
                // Emit a 'chatMessage' message event
                Socket.emit('chatMessage', message);

                // Clear the message text
                vm.message = '';
                vm.sending = false;

            } else {
                vm.messages.push({
                    scope: 'applications',
                    text: vm.message,
                    status: 'pending',
                    room: vm.room
                });

                vm.error = 'Unable to send message. Please ensure you are connected to the internet';
                return (vm.sending = false);

                //application.$update(function () {
                //    vm.message = '';
                //    vm.sending = false;
                //}, processError);
            }
        };

        vm.initSocket = function () {

            if (!!Socket) {
                $log.debug('[AppCtrl] socket exists. Adding `connect` handler');

                $log.info('[AppCtrl] Connecting to chat room: %s', vm.room);
                Socket.emit('join-room', vm.room);


                $log.debug('[AppCtrl] socket exists. Adding `chatMessage` handler');
                // Add an event listener to the 'chatMessage' event
                Socket.on('chatMessage', function (message) {
                    $log.debug('[AppCtrl] Incoming message: %o', message);

                    if (message.type === 'status') {
                        if (message.sender.id === vm.user.id) {
                            $log.debug('I connected');
                            vm.status.me = true;
                        }
                        else {
                            if (message.text.toLowerCase() === 'is now connected') {
                                vm.status.them = true;
                            } else if (message.text.toLowerCase() === 'disconnected') {
                                vm.status.them = false;
                            }
                            else {
                                Raygun.send(new Error('Unknown message received' + message))
                            }
                        }
                    } else {
                        vm.messages.push(message);
                        if(username === vm.username) {
                            vm.status.me = true;
                        } else {
                            vm.status.them = true;
                        }
                    }
                });

                $log.debug('[AppCtrl] socket exists. Adding `$destroy` handler');
                // Remove the event listener when the controller instance is destroyed
                $scope.$on('$destroy', function () {
                    $log.info('[AppCtrl] Disconnecting from chat room: %s', vm.room);
                    Socket.emit('leave-room', vm.room);
                    Socket.removeListener('chatMessage');
                });
            } else {
                $log.warn('Socket is undefined in this context');
            }
        };

        activate();
    }

    ChatClientController.$inject = ['$scope', '$log', 'Authentication', 'Socket'];

    angular.module('chat')
        .controller('ChatClientController', ChatClientController)
        .directive('osetChatConsole', ChatDirective);

})();
