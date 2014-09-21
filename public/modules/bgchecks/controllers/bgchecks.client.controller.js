'use strict';

// Bgchecks controller
angular.module('bgchecks').controller('BgchecksController', ['$scope', '$stateParams', '$location', 'Authentication', 'Bgchecks',
	function($scope, $stateParams, $location, Authentication, Bgchecks ) {
		$scope.authentication = Authentication;

		// Create new Bgcheck
		$scope.create = function() {
			// Create new Bgcheck object
			var bgcheck = new Bgchecks ({
				name: this.name
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
		$scope.remove = function( bgcheck ) {
			if ( bgcheck ) { bgcheck.$remove();

				for (var i in $scope.bgchecks ) {
					if ($scope.bgchecks [i] === bgcheck ) {
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
			var bgcheck = $scope.bgcheck ;

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
	}
]);