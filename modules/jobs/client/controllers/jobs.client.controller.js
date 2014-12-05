(function() {
    'use strict';

    // Jobs controller
    function JobsController($scope, $stateParams, $location, $state, $modal, $log, Authentication, Jobs) {

        $scope.authentication = Authentication;
        $scope.user = Authentication.user;

        // Init addressDetails for creation.
        $scope.showAddressDetails = false;
        $scope.formMode = [];

        $scope.mode = $state.current.data.mode;

        if ($scope.mode === 'create') {
            $scope.job = {
                payRate: {
                    min: null,
                    max: null
                },
                postStatus: 'draft'
            };
        }

        $scope.types = ['main', 'home', 'business', 'billing', 'other'];

        $scope.showAddressDetails = function() {
            event.preventDefault();

            $scope.showAddressDetails = true;
        };

        $scope.upsert = function() {
            if ($scope.mode === 'create') {
                return $scope.create();
            }
            if ($scope.mode === 'edit') {
                return $scope.update();
            }

            $log.warn('Unknown Form Mode: "%s"', $scope.mode);
        };

        // Create new Job
        $scope.create = function() {

            // Create new Job object
            var job = new Jobs.ById($scope.job);

            // Redirect after save
            job.$save(function(response) {
                $location.path('jobs/' + response._id);
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });

            // Clear form fields
            // TODO: Clear all form fields
            ///this.name = '';
        };

        $scope.toggleApplication = function(state, $index) {
            if (state) {
                $scope.formMode[$index] = 'apply';
            } else {
                $scope.formMode[$index] = 'view';
            }
        };



        $scope.delist = function(job) {
            job = job || $scope.job;

            if (!job) {
                $log.debug('Cannot delist without a job');
            }

            job.delist(); // TODO: Implement this somewhere
        };

        // Remove existing Job
        $scope.remove = function(job) {
            if (job) {
                job.$remove();

                for (var i in $scope.jobs) {
                    if ($scope.jobs[i] === job) {
                        $scope.jobs.splice(i, 1);
                    }
                }
            } else {
                $scope.job.$remove(function() {
                    $location.path('jobs');
                });
            }
        };

        // Update existing Job
        $scope.update = function() {
            var job = $scope.job;

            job.$update(function() {
                $location.path('jobs/' + job._id);
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.initList = function() {
            if ($state.is('jobs.list')) {
                $scope.listTitle = 'Outset Job Listings';
                $scope.find();
            } else if ($state.is('jobs.mine')) {
                $scope.listTitle = ($scope.user.type === 'driver') ? 'My Jobs' : 'My Job Postings';

                $scope.findMine();
            }
        };

        // Find a list of Jobs
        $scope.find = function() {
            var user = $scope.authentication.user;

            if (user && user.type === 'owner') {
                $scope.jobs = Jobs.ByUser.query({
                    userId: Authentication.user._id,
                });
            } else {
                $scope.jobs = Jobs.ById.query();
            }
        };

        // Find a list of 'My' Jobs.
        $scope.findMine = function() {
            $scope.jobs = Jobs.ByUser.query({
                userId: Authentication.user._id,
            });
        };
        // Find existing Job
        $scope.findOne = function() {
            if (!$stateParams.jobId) {
                $scope.pageTitle = 'Post New Job';
                return;
            }

            $scope.pageTitle = 'Edit Job';

            $scope.job = Jobs.ById.get({
                jobId: $stateParams.jobId
            });
        };

        $scope.displayMode = 'all';

        $scope.showSection = function(section, only) {
            if (!only && $scope.displayMode === 'all') {
                return true;
            }

            return $scope.displayMode === section;
        };

        $scope.setDisplay = function(section) {
            $scope.displayMode = section || 'all';
        };
    }



    JobsController.$inject = ['$scope', '$stateParams', '$location', '$state', '$modal', '$log', 'Authentication', 'Jobs'];

    angular.module('jobs')
        .controller('JobsController', JobsController);

})();
