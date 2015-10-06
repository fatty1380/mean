'use strict';

// Reviews controller
angular.module('reviews').controller('ReviewsController', ['reviewRequest', '$stateParams', '$location', 'Authentication', 'Reviews',
	function (reviewRequest, $stateParams, $location, Authentication, Reviews) {

		var vm = this;
		
		vm.request = reviewRequest;
		vm.authentication = Authentication;

		// Create new Review
		vm.create = function() {
			// Create new Review object
			var review = new Reviews ({
				name: this.name
			});

			// Redirect after save
			review.$save(function(response) {
				$location.path('reviews/' + response._id);

				// Clear form fields
				vm.name = '';
			}, function(errorResponse) {
				vm.error = errorResponse.data.message;
			});
		};

		// Remove existing Review
		vm.remove = function( review ) {
			if ( review ) { review.$remove();

				for (var i in vm.reviews ) {
					if (vm.reviews [i] === review ) {
						vm.reviews.splice(i, 1);
					}
				}
			} else {
				vm.review.$remove(function() {
					$location.path('reviews');
				});
			}
		};

		// Update existing Review
		vm.update = function() {
			var review = vm.review ;

			review.$update(function() {
				$location.path('reviews/' + review._id);
			}, function(errorResponse) {
				vm.error = errorResponse.data.message;
			});
		};

		// Find a list of Reviews
		vm.find = function() {
			vm.reviews = Reviews.query();
		};

		// Find existing Review
		vm.findOne = function() {
			vm.review = Reviews.get({ 
				reviewId: $stateParams.reviewId
			});
		};
	}
]);