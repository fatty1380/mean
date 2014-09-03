'use strict';

(function() {
	// Drivers Controller Spec
	describe('Drivers Controller Tests', function() {
		// Initialize global variables
		var DriversController,
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

			// Initialize the Drivers controller.
			DriversController = $controller('DriversController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Driver object fetched from XHR', inject(function(Drivers) {
			// Create sample Driver using the Drivers service
			var sampleDriver = new Drivers({
				name: 'New Driver'
			});

			// Create a sample Drivers array that includes the new Driver
			var sampleDrivers = [sampleDriver];

			// Set GET response
			$httpBackend.expectGET('drivers').respond(sampleDrivers);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.drivers).toEqualData(sampleDrivers);
		}));

		it('$scope.findOne() should create an array with one Driver object fetched from XHR using a driverId URL parameter', inject(function(Drivers) {
			// Define a sample Driver object
			var sampleDriver = new Drivers({
				name: 'New Driver'
			});

			// Set the URL parameter
			$stateParams.driverId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/drivers\/([0-9a-fA-F]{24})$/).respond(sampleDriver);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.driver).toEqualData(sampleDriver);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Drivers) {
			// Create a sample Driver object
			var sampleDriverPostData = new Drivers({
				name: 'New Driver'
			});

			// Create a sample Driver response
			var sampleDriverResponse = new Drivers({
				_id: '525cf20451979dea2c000001',
				name: 'New Driver'
			});

			// Fixture mock form input values
			scope.name = 'New Driver';

			// Set POST response
			$httpBackend.expectPOST('drivers', sampleDriverPostData).respond(sampleDriverResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Driver was created
			expect($location.path()).toBe('/drivers/' + sampleDriverResponse._id);
		}));

		it('$scope.update() should update a valid Driver', inject(function(Drivers) {
			// Define a sample Driver put data
			var sampleDriverPutData = new Drivers({
				_id: '525cf20451979dea2c000001',
				name: 'New Driver'
			});

			// Mock Driver in scope
			scope.driver = sampleDriverPutData;

			// Set PUT response
			$httpBackend.expectPUT(/drivers\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/drivers/' + sampleDriverPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid driverId and remove the Driver from the scope', inject(function(Drivers) {
			// Create new Driver object
			var sampleDriver = new Drivers({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Drivers array and include the Driver
			scope.drivers = [sampleDriver];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/drivers\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleDriver);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.drivers.length).toBe(0);
		}));
	});
}());