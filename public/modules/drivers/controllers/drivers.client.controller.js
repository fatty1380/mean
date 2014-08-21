'use strict';

// Drivers controller
angular.module('drivers').controller('DriversController', ['$scope', '$stateParams', '$location', 'Authentication', 'Drivers',
	function($scope, $stateParams, $location, Authentication, Drivers ) {
		$scope.authentication = Authentication;

		// Create new Driver
		$scope.create = function() {
			// Create new Driver object
			var driver = new Drivers ({
				name: this.name
			});

			// Redirect after save
			driver.$save(function(response) {
				$location.path('drivers/' + response._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});

			// Clear form fields
			this.name = '';
		};

		// Remove existing Driver
		$scope.remove = function( driver ) {
			if ( driver ) { driver.$remove();

				for (var i in $scope.drivers ) {
					if ($scope.drivers [i] === driver ) {
						$scope.drivers.splice(i, 1);
					}
				}
			} else {
				$scope.driver.$remove(function() {
					$location.path('drivers');
				});
			}
		};

		// Update existing Driver
		$scope.update = function() {
			var driver = $scope.driver ;

			driver.$update(function() {
				$location.path('drivers/' + driver._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Drivers
		$scope.find = function() {
			$scope.drivers = Drivers.query();
		};

		// Find existing Driver
		$scope.findOne = function() {
			$scope.driver = Drivers.get({ 
				driverId: $stateParams.driverId
			});
		};
	}
]);