'use strict';

(function() {
    // Profile Controller Spec
    describe('ProfileCtrl', function() {
        // Initialize global variables
        var ProfileCtrl,
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
        beforeEach(module(AppConfig.appModuleName));
        beforeEach(module('account'));

        beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
            scope = $rootScope.$new();

            $stateParams = _$stateParams_;
            $httpBackend = _$httpBackend_;
            $location = _$location_;

            // Initialize the Articles controller.
            ProfileCtrl = $controller('ProfileCtrl', {
            });
        }));

        it('should get Profile Data for selected user ', inject(function(profileService) {
            // Create sample article using the Articles service
            var profileSample = profileService.getProfile('55a6600d2944b0bd1536414e').then(function (data) {
                return data;
            });

            $httpBackend.whenGET("http://outset-shadow.elasticbeanstalk.com/api/profiles/55a6600d2944b0bd1536414e").respond(profileSample);

            //expect a get request to "internalapi/quotes"
            $httpBackend.expectGET("http://outset-shadow.elasticbeanstalk.com/api/profiles/55a6600d2944b0bd1536414e");

            // Run controller functionality
            ProfileCtrl.getProfile();
            $httpBackend.flush();

            // Test scope value
            expect(ProfileCtrl.profileData).toEqualData(profileSample);
        }));
    });
}());
