(function () {
    'use strict';

    function ApplicationMainController(application, auth, $state, $log, $scope, Socket, Applications, $location, $anchorScroll) {
        var vm = this;

        if(!application) {
            debugger;
        }
        vm.Applications = Applications;
        vm.application = application;
        vm.user = auth.user;
        vm.text = {};
        vm.activeConnection = false;

        vm.rawMessages = JSON.stringify(application.messages, undefined, 2);

        // Update existing Application
        vm.application.update = function () {
            var application = vm.application.application;

            application.$update(function (retval) {
                debugger; // todo: check retval
            }, processError);
        };

        vm.goBack = $state.gotoPrevious;

        var activate = function () {
            if (vm.application.connection && vm.application.connection.isValid) {
                vm.activeConnection = true;
            }
            else {
                $log.debug('No connection, or invalid connection - not creating socket.');
            }

            if(vm.user.isOwner && vm.application.isUnreviewed) {
                vm.setApplicationStatus('read');
            }

            vm.text.noconnection = (vm.user.isDriver) ?
                'The employer has not yet connected with you. Once they have, they will have access to your full profile and will be able to chat with you right here.' :
                'In order to view reports and chat with this applicant, you must first <em>Connect</em> with them using the button below. This will count against your monthly allotment of connections.';
        };

        vm.setApplicationStatus = function(status) {

            var app = vm.Applications.setStatus(vm.application._id, status);

            app.then(function(success) {
                $log.debug('[setApplicationStatus] %s', success);
                _.extend(application,success);
            }, function(reject) {
                $log.warn('[setApplicationStatus] %s', reject);
            });
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

                $log.debug('Created new connection! %o', newConnection);

                var params = $state.params;
                params.newlyConnected = true;

                return $state.go($state.current, params, {reload: true});
            }, function (err) {
                $log.debug('New connection failed: %o', err);
                vm.connecting = false;
                return err;
            });
        };

        activate();
    }

    ApplicationMainController.$inject = ['application', 'Authentication', '$state', '$log', '$scope', 'Socket', 'Applications', '$location', '$anchorScroll'];

    angular.module('applications')
        .controller('ApplicationMainController', ApplicationMainController);
})();
