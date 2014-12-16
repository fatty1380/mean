(function() {
    'use strict';

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

        $scope.postMessage = function() {
            var application = $scope.application;

            application.messages.push({
                text: $scope.message,
                status: 'sent',
                sender: $scope.authentication.user._id
            });

            application.$update(function() {
                $scope.message = '';
            }, processError);
        };

        // Update existing Application
        $scope.update = function() {
            var application = $scope.application;

            application.$update(function() {
                $location.path('applications/' + application._id);
            }, processError);
        };

        var processError = function(errorResponse) {
            switch (errorResponse.status) {
                case 403:
                    $scope.error = 'Sorry, you cannot make changes to this application';
                    $location.path('/settings/profile/');
                    break;
                default:
                    $scope.error = errorResponse.data.message;
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

        // Find a list of 'My' Jobs.
        $scope.findMine = function(type) {
            $scope.applications = Applications.ByUser.query({
                userId: Authentication.user._id,
                userType: type
            });
        };

        // Find existing Application
        $scope.findOne = function() {
            $scope.application = Applications.ById.get({
                id: $stateParams.applicationId
            });
        };
    }

    ApplicationsController.$inject = ['$scope', '$stateParams', '$location', '$state', '$log', 'Authentication', 'Applications'];

    angular.module('applications').controller('ApplicationsController', ApplicationsController);
})();
