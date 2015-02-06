(function () {
    'use strict';

    function ApplicationMainController(application, auth, $state, $log, $scope, Socket, Applications, $location, $anchorScroll) {
        var vm = this;
        vm.application = application;
        vm.messageMode = 'multiline';
        vm.isopen = false;
        vm.myId = auth.user._id;
        vm.user = auth.user;
        vm.room = vm.application._id;
        vm.text = {};
        vm.activeConnection = false;

        vm.status = {
            me: null,
            them: null
        };

        vm.rawMessages = JSON.stringify(application.messages, undefined, 2);

        // Update existing Application
        vm.application.update = function () {
            var application = vm.application.application;

            application.$update(function (retval) {
                debugger; // todo: check retval
            }, processError);
        };

        var activate = function () {
            if (vm.application.connection && vm.application.connection.isValid) {
                vm.activeConnection = true;
                $log.debug('creating socket for connection');
                vm.initSocket();
            }
            else {
                $log.debug('No connection, or invalid connection - not creating socket.');
            }

            vm.text.noconnection = (vm.user.type === 'driver')
                ? 'The employer has not yet connected with you. Once they have, they will have access to your full profile and will be able to chat with you right here.'
                : 'In order to view reports and chat with this applicant, you must first <em>Connect</em> with them using the button below. This will count against your monthly allotment of connections.';
        };

        /** Private Methods --------------------------------------------- */
        var processError = function (errorResponse) {

            switch (errorResponse.status) {
                case 403:
                    vm.error = 'Sorry, you cannot make changes to this application';
                    $state.go('home');
                    break;
                default:
                    vm.error = errorResponse.data.message;
            }
        };

        vm.scrollToMessages = function () {
            // set the location.hash to the id of
            // the element you wish to scroll to.
            $location.hash('messaging');

            // call $anchorScroll()
            $anchorScroll();

            vm.msgFocus = true;
        };

        /** Connection Methods ------------------------------------------- */

        vm.createConnection = function () {
            vm.connecting = true;
            if (vm.application.connection) {
                $log.debug('Existing Connection: %o', vm.application.connection);
                debugger;
            }

            Applications.createConnection(vm.application).then(function (newConnection) {
                debugger;
                $log.debug('Created new connection! %o', newConnection);
                vm.application.connection = newConnection;
                vm.newlyConnected = true;
                vm.initSocket();
                return newConnection;
            }, function (err) {
                $log.debug('New connection failed: %o', err);
                return err;
            }).then(function () {
                debugger;
                vm.connecting = false;
            });
        };


        /** Chat Methods ------------------------------------------------ */
        vm.postMessage = function () {
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
                vm.application.messages.push({
                    text: vm.message,
                    status: 'sent',
                    sender: auth.user
                });

                application.$update(function () {
                    vm.message = '';
                    vm.sending = false;
                }, processError);
            }
        };

        vm.initSocket = function () {

            if (!!Socket) {
                $log.debug('[AppCtrl] socket exists. Adding `connect` handler');
                Socket.on('connect', function () {
                    $log.info('[AppCtrl] Connecting to chat room: %s', vm.room);
                    Socket.emit('join-room', vm.room);
                });

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
                        vm.application.messages.push(message);
                    }
                });

                $log.debug('[AppCtrl] socket exists. Adding `$destroy` handler');
                // Remove the event listener when the controller instance is destroyed
                $scope.$on('$destroy', function () {
                    $log.info('[AppCtrl] Connecting to chat room: %s', vm.room);
                    Socket.emit('leave-room', vm.room);
                    debugger;
                    Socket.removeListener('chatMessage');
                });
            } else {
                $log.warn('Socket is undefined in this context');
            }
        };

        activate();
    }

    ApplicationMainController.$inject = ['application', 'Authentication', '$state', '$log', '$scope', 'Socket', 'Applications', '$location', '$anchorScroll'];

    angular.module('applications')
        .controller('ApplicationMainController', ApplicationMainController);
})();
