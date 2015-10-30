(function() {
	'use strict';

// Reviews controller
	angular.module('reviews').controller('ReviewsController', ReviewsController);

	ReviewsController.$inject = ['reviewRequest', '$stateParams', '$location', 'Authentication', 'Reviews'];
	
	function ReviewsController(reviewRequest, $stateParams, $location, Authentication, Reviews) {

		var vm = this;
		
		vm.request = reviewRequest;
		vm.authentication = Authentication;
		
		///////////////////////////////////////////////////////
		
		// Create new Review
		vm.create = function() {
			// Create new Review object
			var review = new Reviews.ByUser (vm.review);

			// Redirect after save
			review.$save(function (response) {
				
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

	ReviewEditController.$inject = ['$log', '$state', '$stateParams', '$location', 'reviewRequest', 'profile', 'review', 'Authentication', 'Reviews' ];
	
	function ReviewEditController($log, $state, $stateParams, $location, reviewRequest, profile, review, Authentication, Reviews) {

		var vm = this;
	
		vm.request = reviewRequest || {};
		vm.authentication = Authentication;
		vm.review = review || {};
	
        vm.faqs = faqs;
	
		// Exposed Methods
		vm.create = create;
		
		activate();
		
		/////////////////////////////////////////////////////////////////
		
		function activate() {
			
			if (_.isEmpty(vm.request) && _.isEmpty(vm.review)) {
				$log.error('No review or review request in parameters ... redirecting');
				
				vm.error = 'Unable to find Review';
			}
			
			vm.profile = profile;
			vm.review.userId = profile.id;
			vm.profileName = profile.displayName;
			
			var contactInfo = vm.request.contactInfo || {};
			
			vm.greetingText = vm.request.text;
			
			vm.review.name = contactInfo.displayName || contactInfo.firstName || contactInfo.lastName;
			vm.review.email = contactInfo.email;
			vm.review.phone = contactInfo.phoneNumber;
			vm.review.requestId = reviewRequest.id;
		}

		// Create new Review
		function create() {
			// Create new Review object
			vm.error = null;
			var review = new Reviews.byUser(vm.review);
			
			if (!vm.review.email && !vm.review.phone) {
				vm.error = 'Please enter either a phone number or email address';
				return;
			}
			
			if (!vm.review.rating) {
				vm.error = 'Please select a rating';
				return;
			}
			
			if (vm.reviewForm.$invalid) {
				_.each(vm.reviewForm.$error.required, function (field) {
					vm.error = 'Please enter a ' + field.$name;
				});
				
				return;
			}

			// Redirect after save
			review.$save(function (response) {
				debugger;
				$state.go('trucker', { userId: profile.id || response.user.id || response.user });

				// Clear form fields
				vm.review = {};
			}, function (errorResponse) {
				vm.error = errorResponse.data.message;
			});
		}
	}

	var faqs = [
        {
            question: 'What do you need my information for?',
            answer: 'We use your information to ensure that each review is tied to a real person - and to ensure the integrity of the site'
        },
        {
            question: 'What information will be visible to users?',
            answer: 'Only your name will be shown to the driver or other users. We will keep your contact information hidden at all times.'
        },
        {
            question: 'What will my email and phone number be used for?',
            answer: 'We will be providing other users to check references for reviews. Communication will be handled through TruckerLine and your email and phone number will aways remain private.'
        }
    ];
})();