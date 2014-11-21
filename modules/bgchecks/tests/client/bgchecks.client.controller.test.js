'use strict';

(function() {
	// Bgchecks Controller Spec
	describe('Bgchecks Controller Tests', function() {
		// Initialize global variables
		var BgchecksController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Bgchecks controller.
			BgchecksController = $controller('BgchecksController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Bgcheck object fetched from XHR', inject(function(Bgchecks) {
			// Create sample Bgcheck using the Bgchecks service
			var sampleBgcheck = new Bgchecks({
				name: 'New Bgcheck'
			});

			// Create a sample Bgchecks array that includes the new Bgcheck
			var sampleBgchecks = [sampleBgcheck];

			// Set GET response
			$httpBackend.expectGET('bgchecks').respond(sampleBgchecks);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.bgchecks).toEqualData(sampleBgchecks);
		}));

		it('$scope.findOne() should create an array with one Bgcheck object fetched from XHR using a bgcheckId URL parameter', inject(function(Bgchecks) {
			// Define a sample Bgcheck object
			var sampleBgcheck = new Bgchecks({
				name: 'New Bgcheck'
			});

			// Set the URL parameter
			$stateParams.bgcheckId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/bgchecks\/([0-9a-fA-F]{24})$/).respond(sampleBgcheck);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.bgcheck).toEqualData(sampleBgcheck);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Bgchecks) {
			// Create a sample Bgcheck object
			var sampleBgcheckPostData = new Bgchecks({
				name: 'New Bgcheck'
			});

			// Create a sample Bgcheck response
			var sampleBgcheckResponse = new Bgchecks({
				_id: '525cf20451979dea2c000001',
				name: 'New Bgcheck'
			});

			// Fixture mock form input values
			scope.name = 'New Bgcheck';

			// Set POST response
			$httpBackend.expectPOST('bgchecks', sampleBgcheckPostData).respond(sampleBgcheckResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Bgcheck was created
			expect($location.path()).toBe('/bgchecks/' + sampleBgcheckResponse._id);
		}));

		it('$scope.update() should update a valid Bgcheck', inject(function(Bgchecks) {
			// Define a sample Bgcheck put data
			var sampleBgcheckPutData = new Bgchecks({
				_id: '525cf20451979dea2c000001',
				name: 'New Bgcheck'
			});

			// Mock Bgcheck in scope
			scope.bgcheck = sampleBgcheckPutData;

			// Set PUT response
			$httpBackend.expectPUT(/bgchecks\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/bgchecks/' + sampleBgcheckPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid bgcheckId and remove the Bgcheck from the scope', inject(function(Bgchecks) {
			// Create new Bgcheck object
			var sampleBgcheck = new Bgchecks({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Bgchecks array and include the Bgcheck
			scope.bgchecks = [sampleBgcheck];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/bgchecks\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleBgcheck);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.bgchecks.length).toBe(0);
		}));
	});
}());