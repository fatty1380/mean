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
                $scope: scope
            });
        }));

        it('get profile ', inject(function(profileService) {
            // Create sample article using the Articles service
            var profileSample = {
                "_id": "55a6600d2944b0bd1536414e",
                "modified": "2015-07-15T13:28:45.741Z",
                "displayName": "Serge Rykov",
                "username": "s.rykov@mobidev.biz",
                "provider": "local",
                "__v": 0,
                "requests": [],
                "friends": [],
                "addresses": [],
                "company": null,
                "driver": "55a6600d2944b0bd1536414f",
                "phone": "",
                "email": "s.rykov@mobidev.biz",
                "type": "driver",
                "created": "2015-07-15T13:28:45.702Z",
                "handle": null,
                "profileImageURL": "modules/users/img/profile/default.png",
                "lastName": "Rykov",
                "firstName": "Serge",
                "isOwner": false,
                "isDriver": true,
                "isAdmin": false,
                "shortName": "SergeR",
                "id": "55a6600d2944b0bd1536414e"
            };

            // Set GET response
            $httpBackend.expectGET('http://outset-shadow.elasticbeanstalk.com/api/profiles/55a6600d2944b0bd1536414e').respond(profileSample);

            // Run controller functionality
            scope.getProfile();
            $httpBackend.flush();

            // Test scope value
            expect(scope.vm.profileData).toEqualData(profileSample);
        }));
    });
}());
