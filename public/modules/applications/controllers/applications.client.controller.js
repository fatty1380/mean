'use strict';

// Applications controller
function ApplicationsController($scope, $stateParams, $location, $state, Authentication, Applications) {
    $scope.authentication = Authentication;
    $scope.activeModule = $scope.activeModule || 'applications';
    $scope.placeholders = {
        intro: 'Write a short message explaining why you\'re a good fit for the position.',
        errors: {
            noJob: 'You must select a job to apply to first, or you can save as a draft',
            noMessage: 'Please enter a message before submitting your application'
        }
    };

    // Create new Application
    $scope.create = function() {

        if (!$scope.job || !$scope.job._id) {
            $scope.error = $scope.placeholders.errors.noJob;
            return;
        }

        console.log('[AppController.create]', 'Creating new Application');
        // Create new Application object
        var application = new Applications.ByJob({
            jobId: $scope.job._id,
            status: 'submitted'
        });

        createApplication(application);
    };

    $scope.saveDraft = function() {
        console.log('[AppController.saveDraft]', 'Creating new Draft Application');
        // Create new Application object
        var application = new Applications.ById({
            status: 'draft'
        });

        createApplication(application);
    };

    var createApplication = function(application) {
        if (!$scope.message || $scope.message.length < 1) {
            $scope.error = $scope.placeholders.errors.noMessage;
            return;
        }

        application.jobId = $scope.job && $scope.job._id && ($scope.job._id);
        application.messages = [{
            text: $scope.message,
            status: 'sent',
            sender: $scope.authentication.user._id
        }];

        // Redirect after save
        application.$save(function(response) {
            debugger;

            // Clear form fields
            $scope.message = '';
            $location.path('applications/' + response._id);
        }, function(errorResponse) {
            $scope.error = errorResponse.data.message;
        });
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

    $scope.initJobList = function() {
        $scope.listTitle = 'Applications';
        $scope.findAll();
    };

    $scope.initList = function() {
        debugger;

        var isAdmin = $scope.authentication.user.roles.indexOf('admin') !== -1;

        if ($state.is('listApplications') && isAdmin) {
            $scope.listTitle = 'Outset Job Application Listings';
            $scope.findAll();
        } else if ($state.is('myApplications') && $scope.authentication.user.type === 'driver') {
            $scope.listTitle = 'My Job Applications';

            $scope.findMine();
        } else {
            $location.path('/applications/me');
        }
    };

    // Find a list of Applications
    $scope.findAll = function() {
        console.log('[AppController.find] Searching for applications');

        var jobId = ($scope.job.$resolved && $scope.job._id) || $stateParams.jobId;

        if (jobId) {
            console.log('[AppController.find] Looking for applications on jobID %o', jobId._id);

            $scope.applications = Applications.ByJob.query({
                jobId: jobId
            });
        } else {
            $scope.applications = Applications.ById.query();
        }

    };

    // Find a list of 'My' Jobs.
    $scope.findMine = function() {
        $scope.applications = Applications.ByUser.query({
            userId: Authentication.user._id,
        });
    };

    // Find existing Application
    $scope.findOne = function() {
        $scope.application = Applications.ById.get({
            id: $stateParams.applicationId
        });
    };
}

ApplicationsController.$inject = ['$scope', '$stateParams', '$location', '$state', 'Authentication', 'Applications'];

angular.module('applications').controller('ApplicationsController', ApplicationsController);
