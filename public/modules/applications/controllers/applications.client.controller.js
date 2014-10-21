'use strict';

// Applications controller
angular.module('applications').controller('ApplicationsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Applications',
	function($scope, $stateParams, $location, Authentication, Applications ) {
		$scope.authentication = Authentication;
		$scope.placeholders = {'intro': 'Write a short message explaining why you\'re a good fit for the position.'};

		// Create new Application
		$scope.create = function() {
			debugger;
			console.log('[AppController.create]', 'Creating new Application');
			// Create new Application object
			var application = new Applications.ById ({
				messages: [{text: this.message, status: 'sent'}]
			});

			// Redirect after save
			application.$save(function(response) {
				//$location.path('applications/' + response._id);

				// Clear form fields
				$scope.message = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Application
		$scope.remove = function( application ) {
			if ( application ) { application.$remove();

				for (var i in $scope.applications ) {
					if ($scope.applications [i] === application ) {
						$scope.applications.splice(i, 1);
					}
				}
			} else {
				$scope.application.$remove(function() {
					$location.path('applications');
				});
			}
		};

		// Update existing Application
		$scope.update = function() {
			var application = $scope.application ;

			application.$update(function() {
				$location.path('applications/' + application._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Applications
		$scope.find = function() {
			console.log('[AppController.find] Searching for applications');
			if ($scope.job) {
				debugger;
				console.log('[AppController.find] Looking for applications on jobID %o', $scope.job._id);

				$scope.applications = Applications.ByJob({id : $scope.job._id});
			} else {
				debugger;
				$scope.applications = Applications.ById.query();
			}

		};

		// Find existing Application
		$scope.findOne = function() {
			$scope.application = Applications.ById.get({
				id: $stateParams.applicationId
			});
		};
	}
]);
