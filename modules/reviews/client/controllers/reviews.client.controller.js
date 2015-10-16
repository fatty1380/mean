(function() {
	'use strict';

// Reviews controller
	angular.module('reviews').controller('ReviewsController', ReviewsController);

	ReviewsController.$inject = ['reviewRequest', '$stateParams', '$location', 'Authentication', 'Reviews'];
	
	function ReviewsController(reviewRequest, $stateParams, $location, Authentication, Reviews) {

		var vm = this;
		
		vm.request = reviewRequest;
		vm.authentication = Authentication;

		// Create new Review
		vm.create = function() {
			// Create new Review object
			var review = new Reviews.byId ({
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
			vm.reviews = Reviews.byId.query();
		};

		// Find existing Review
		vm.findOne = function() {
			vm.review = Reviews.byId.get({ 
				reviewId: $stateParams.reviewId
			});
		};
	}
	
	
	angular.module('reviews').controller('ReviewEditCtrl', ReviewEditController);

	ReviewsController.$inject = ['reviewRequest', 'profile', 'review', '$stateParams', '$location', 'Authentication', 'Reviews' ];
	
	function ReviewEditController(reviewRequest, profile, review, $stateParams, $location, Authentication, Reviews) {

		var vm = this;
	
		vm.request = reviewRequest;
		vm.authentication = Authentication;
		vm.review = review || {};
	
		// Exposed Methods
		vm.create = create;
		
		activate();
		
		/////////////////////////////////////////////////////////////////
		
		function activate() {
			
			vm.review.userId = profile.id;
			vm.profileName = profile.displayName;
			
			var contactInfo = vm.request.contactInfo || {};
			
			vm.greetingText = vm.request.text || 'Hi htere mister!';
			
			vm.review.name = contactInfo.displayName || contactInfo.firstName || contactInfo.lastName;
			vm.review.email = contactInfo.email;
			vm.review.phone = contactInfo.phoneNumber;
			vm.review.requestId = reviewRequest.id;
		}

		// Create new Review
		function create() {
			// Create new Review object
			var review = new Reviews.byUser(vm.review);

			// Redirect after save
			review.$save(function (response) {
				debugger;
				$state.go('users.view', { userId: profile.id || response.user.id || response.user });

				// Clear form fields
				vm.review = {};
			}, function (errorResponse) {
				vm.error = errorResponse.data.message;
			});
		}
	}
})();