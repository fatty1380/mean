(function() {
    'use strict';

    function ApplicationMainController(application, auth, $state, $log, $scope, Socket) {
        var vm = this;
        vm.application = application;
        vm.messageMode = 'text';
        vm.isopen = false;
        vm.myId = auth.user._id;
        vm.user = auth.user;
        vm.room = vm.application._id;

        vm.rawMessages = JSON.stringify(application.messages, undefined, 2);

        vm.postMessage = function() {
            vm.application.messages.push({
                text: vm.message,
                status: 'sent',
                sender: auth.user._id
            });

            if (!!Socket) {
                var message = {
                    scope: 'applications',
                    text: vm.message
                };

                console.log('[AppCtrl.PostMessage] Emitting Message');
                // Emit a 'chatMessage' message event
                Socket.emit('chatMessage', message);

                // Clear the message text
                vm.message = '';

            } else {

                application.$update(function () {
                    vm.message = '';
                }, processError);
            }
        };

        // Update existing Application
        vm.application.update = function() {
            var application = vm.application.application;

            application.$update(function(retval) {
                debugger; // todo: check retval
            }, processError);
        };

        /** Private Methods --------------------------------------------- */
        var processError = function(errorResponse) {

            switch (errorResponse.status) {
                case 403:
                    vm.error = 'Sorry, you cannot make changes to this application';
                    $state.go('home');
                    break;
                default:
                    vm.error = errorResponse.data.message;
            }
        };


        /** Chat Methods ------------------------------------------------ */



        if (!!Socket) {
            console.log('[AppCtrl] socket exists. Adding `connect` handler');
            Socket.on('connect', function() {
                $log.info('[AppCtrl] Connecting to chat room: %s', vm.room);
                Socket.emit('join-room', vm.room);
            });

            console.log('[AppCtrl] socket exists. Adding `chatMessage` handler');
            // Add an event listener to the 'chatMessage' event
            Socket.on('chatMessage', function (message) {
                console.log('[AppCtrl] Incoming message: %o', message);
                vm.application.messages.push(message);
            });

            console.log('[AppCtrl] socket exists. Adding `$destroy` handler');
            // Remove the event listener when the controller instance is destroyed
            $scope.$on('$destroy', function () {
                Socket.removeListener('chatMessage').leave(vm.room);
            });
        } else {
            $log.warn('Socket is undefined in this context');
        }
    }

    // Applications controller
    function ApplicationsController($scope, $stateParams, $location, $state, $log, Authentication, Applications) {
        $scope.authentication = Authentication;
        $scope.activeModule = $scope.activeModule || 'applications';
        $scope.placeholders = {
            intro: 'Write a short message explaining why you\'re a good fit for the position.',
            errors: {
                noJob: 'You must select a job to apply to first, or you can save as a draft',
                noMessage: 'Please enter a message before submitting your application'
            }
        };

        // Remove existing Application
        $scope.remove = function(application) {
            if (application) {
                application.$remove();

                for (var i in $scope.applications) {
                    if ($scope.applications[i] === application) {
                        $scope.applications.splice(i, 1);
                    }
                }
            } else {
                $scope.application.$remove(function() {
                    $location.path('applications');
                });
            }
        };

        /**
         * initJobList
         * -----------
         * Used to find all applications for the given job
         */
        $scope.initJobList = function(job) {
            $scope.listTitle = Authentication.user.type === 'driver' ? 'My Application Status' : 'Applications';
            $scope.findAll(job);
        };

        $scope.initList = function() {

            var isAdmin = $scope.authentication.isAdmin();
            var userType = $scope.authentication.user.type;

            if ($state.is('applications.list') && isAdmin) {
                $log.info('[AC.initList] Finding all applications in the system for Admin user');
                $scope.listTitle = 'Outset Job Application Listings';
                $scope.findAll();
            } else {
                $log.info('[AC.initList] Routing to "My Applications" for state %s', $state.$current.name);

                if (userType === 'driver') {
                    $scope.listTitle = 'My Job Applications';
                    $scope.noItemsText = 'You have not applied to any jobs yet.';
                } else if (userType === 'owner') {
                    $scope.listTitle = 'Active Job Applications';
                    $scope.noItemsText = 'No job applications yet';
                }

                $scope.findMine(userType);
            }
        };

        // Find a list of Applications
        $scope.findAll = function(job) {
            $log.debug('[AppController.find] Searching for applications');

            var jobId = (job && job._id) || ($scope.job && $scope.job._id) || $stateParams.jobId;

            if (jobId) {
                $log.debug('[AppController.find] Looking for applications on jobID %o', jobId._id);

                $scope.applications = Applications.ByJob.query({
                    jobId: jobId
                });
            } else {
                $scope.applications = Applications.ById.query();
            }

        };
    }

    ApplicationMainController.$inject = ['application', 'Authentication', '$state', '$log', '$scope', 'Socket'];
    ApplicationsController.$inject = ['$scope', '$stateParams', '$location', '$state', '$log', 'Authentication', 'Applications'];

    angular.module('applications')
        .controller('ApplicationsController', ApplicationsController)
    .controller('ApplicationMainController', ApplicationMainController);
})();
