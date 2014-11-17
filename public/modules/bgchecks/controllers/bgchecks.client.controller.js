(function() {
    'use strict';

    // Bgchecks controller

    var BGChecksController = function($scope, $stateParams, $location, $http, $log, Authentication, Bgchecks, Stubs) {
        $scope.authentication = Authentication;

        // Watch for changes on the selected applicant
        $scope.$watch('applicant', function(newValue, oldValue) {
            if (newValue === oldValue) {
                $log.debug('no change in applicant - why did this get fired?');
                return;
            }

            $scope.selectApplicant(newValue.applicantId);
        });

        $scope.loadApplicants = function() {
            $http.get('/bgcheck/login')
                .success(function(response) {
                    $http.get('/bgcheck/applicants')
                        .success(function(response) {
                            $log.debug('got applicants: %o', response.applicants);

                            $scope.applicants = response.applicants;
                        })
                        .error(function(response) {
                            $scope.error = 'Unable to retrieve applicants for query';

                            $scope.applicants = Stubs.applcantList;
                        });
                })
                .error(function(response) {
                    $scope.error = 'Unable to connect to Background Check service';

                    $scope.applicants = Stubs.applcantList;
                });
        };

        $scope.selectApplicant = function(id) {
            $log.debug('Applicant %d selected ... loading info', id);
            $http.get('/bgcheck/applicants/' + id)
                .success(function(response) {
                    $log.debug('got applicant info: %o', response);

                    $scope.applicantInfo = response;
                })
                .error(function(errorResponse) {
                    $scope.error = 'Unable to load Applicant\'s information';

                    $scope.applicantInfo = Stubs.applicant;
                });
        };

        // Create new Bgcheck
        $scope.create = function() {
            // Create new Bgcheck object
            var bgcheck = new Bgchecks({
                name: this.name,
                'applicant': this.applicant
            });

            // Redirect after save
            bgcheck.$save(function(response) {
                $location.path('bgchecks/' + response._id);

                // Clear form fields
                $scope.name = '';
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Remove existing Bgcheck
        $scope.remove = function(bgcheck) {
            if (bgcheck) {
                bgcheck.$remove();

                for (var i in $scope.bgchecks) {
                    if ($scope.bgchecks[i] === bgcheck) {
                        $scope.bgchecks.splice(i, 1);
                    }
                }
            } else {
                $scope.bgcheck.$remove(function() {
                    $location.path('bgchecks');
                });
            }
        };

        // Update existing Bgcheck
        $scope.update = function() {
            var bgcheck = $scope.bgcheck;

            bgcheck.$update(function() {
                $location.path('bgchecks/' + bgcheck._id);
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Find a list of Bgchecks
        $scope.find = function() {
            $scope.bgchecks = Bgchecks.query();
        };

        // Find existing Bgcheck
        $scope.findOne = function() {
            $scope.bgcheck = Bgchecks.get({
                bgcheckId: $stateParams.bgcheckId
            });
        };
    };

    BGChecksController.$inject = ['$scope', '$stateParams', '$location', '$http', '$log', 'Authentication', 'Bgchecks', 'StubValues'];

    angular.module('bgchecks').controller('BgchecksController', BGChecksController);
})();
