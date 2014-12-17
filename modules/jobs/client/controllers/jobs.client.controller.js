(function () {
    'use strict';

    // Jobs controller
    function JobsController($scope, $stateParams, $location, $state, $modal, $log, Authentication, Jobs, Companies, job, jobs, company) {

        $scope.authentication = Authentication;
        $scope.user = Authentication.user;

        $scope.enableEdit = false;

        $scope.job = job;
        $scope.jobs = jobs;
        $scope.company = company || job && typeof job.company === 'object' && job.company || undefined;

        // Init addressDetails for creation.
        $scope.showAddressDetails = false;
        $scope.formMode = [];

        var defaultAddr = {type: 'main', streetAddresses: ['']};

        activate();

        function activate() {
            if ($state.is('jobs.create')) {

                if (!$scope.company) {
                    $scope.company = ($stateParams.companyId) ? Companies.ById.get({
                        companyId: $stateParams.companyId
                    }) : Companies.ByUser.get({
                        userId: $scope.user._id
                    });
                }

                $scope.job = {
                    payRate: {
                        min: null,
                        max: null
                    },
                    location: [defaultAddr],
                    postStatus: 'draft',
                    companyId: !!$scope.company && $scope.company._id || $stateParams.companyId
                };
            }
            else if ($state.is('jobs.edit')) {
                if (!$scope.job.location) {
                    $scope.job.location = [];
                }

                if ($scope.job.location.length === 0) {
                    $scope.job.location.push(defaultAddr);
                }
            }

            if ($scope.user.type === 'driver') {
                $scope.enableEdit = false;
            }
            else if ($scope.user.type === 'owner') {
                $scope.enableEdit = $scope.user._id === ($scope.company && ($scope.company.owner._id || $scope.company.owner));
            }

            $log.debug('[JobCtrl.activate] %s enableEdit: %o', $scope.user.type, $scope.enableEdit);

        }

        $log.debug('State Params: %o', $stateParams);

        $scope.types = ['main', 'home', 'business', 'billing', 'other'];

        $scope.showAddressDetails = function () {
            event.preventDefault();

            $scope.showAddressDetails = true;
        };

        $scope.upsert = function () {
            if ($state.is('jobs.create')) {
                return $scope.create();
            }
            if ($state.is('jobs.edit')) {
                return $scope.update();
            }

            $log.warn('Unknown Form Mode: "%s"', $scope.mode);
            $scope.error = 'Unknown Form Mode';
        };

        // Create new Job
        $scope.create = function () {

            debugger; // todo - check companyId status
            $scope.job.companyId = $scope.job.companyId || $scope.company._id;

            if (!$scope.job.companyId) {
                $log.error('Cannot create a job without a company ID!');
                $scope.error = 'Company is not defined, please try again later';
                return;
            }

            // Create new Job object
            var job = new Jobs.ById($scope.job);

            // Redirect after save
            job.$save(function (response) {
                $location.path('jobs/' + response._id);
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });

            // Clear form fields
            // TODO: Clear all form fields
            ///this.name = '';
        };

        $scope.delist = function (job) {
            job = job || $scope.job;

            if (!job) {
                $log.debug('Cannot delist without a job');
            }

            job.delist(); // TODO: Implement this somewhere
        };

        // Remove existing Job
        $scope.remove = function (job) {
            if (job) {
                job.$remove();

                for (var i in $scope.jobs) {
                    if ($scope.jobs[i] === job) {
                        $scope.jobs.splice(i, 1);
                    }
                }
            } else {
                $scope.job.$remove(function () {
                    $location.path('jobs');
                });
            }
        };

        // Update existing Job
        $scope.update = function () {
            var job = $scope.job;

            job.$update(function () {
                $location.path('jobs/' + job._id);
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.initList = function () {
            if ($state.is('jobs.list')) {
                $scope.listTitle = 'Outset Job Listings';
                $scope.find();
            } else if ($state.is('jobs.mine')) {
                $scope.listTitle = ($scope.user.type === 'driver') ? 'My Jobs' : 'My Job Postings';
                $scope.findMine();
            }
        };

        // Find a list of Jobs
        $scope.find = function () {

            if (!!$scope.jobs) {
                $log.debug('[JobsController.find()] %d jobs already loaded', $scope.jobs.length);
                return;
            }

            var user = $scope.authentication.user;

            if (user && user.type === 'owner') {
                $scope.jobs = Jobs.ByUser.query({
                    userId: Authentication.user._id
                });
            } else {
                $scope.jobs = Jobs.ById.query();
            }
        };

        // Find a list of 'My' Jobs.
        $scope.findMine = function () {
            if (!!$scope.jobs) {
                $log.debug('[JobsController.findMine()] %d jobs already loaded', $scope.jobs.length);
                return;
            }

            $scope.jobs = Jobs.ByUser.query({
                userId: Authentication.user._id
            });
        };
        // Find existing Job
        $scope.findOne = function () {
            if ($state.is('jobs.create')) {
                $scope.pageTitle = 'Post New Job';
                return;
            }

            $scope.pageTitle = 'Edit Job';

            $scope.job = $scope.job || Jobs.ById.get({
                jobId: $stateParams.jobId
            });
        };
    }


    JobsController.$inject = ['$scope', '$stateParams', '$location', '$state', '$modal', '$log', 'Authentication', 'Jobs', 'Companies', 'job', 'jobs', 'company'];

    angular.module('jobs')
        .controller('JobsController', JobsController);

})();
