'use strict';

(function() {
    // Profile Controller Spec
    describe('ProfileCtrl', function() {
        // Initialize global variables
        var ProfileCtrl,
            $httpBackend;

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

        // Create
        beforeEach(inject(function($controller, _$httpBackend_, $rootScope) {
            //$httpBackend = _$httpBackend_;
            // Initialize the ProfileCtrl controller.
            var scope = $rootScope.$new();
            ProfileCtrl = $controller('ProfileCtrl', {
                $scope: scope
            });
        }));


        //it('should get and set Profile Data for selected user ', function() {
        //    // Create sample article using the Articles service
        //    var profileSample = {
        //        "_id": "55a6600d2944b0bd1536414e",
        //        "modified": "2015-07-15T13:28:45.741Z",
        //        "displayName": "Serge Rykov",
        //        "username": "s.rykov@mobidev.biz",
        //        "provider": "local",
        //        "__v": 0,
        //        "requests": [],
        //        "friends": [],
        //        "addresses": [],
        //        "company": null,
        //        "driver": "55a6600d2944b0bd1536414f",
        //        "phone": "",
        //        "email": "s.rykov@mobidev.biz",
        //        "type": "driver",
        //        "created": "2015-07-15T13:28:45.702Z",
        //        "roles": [
        //            "user"
        //        ],
        //        "oldPass": false,
        //        "handle": null,
        //        "profileImageURL": "modules/users/img/profile/default.png",
        //        "lastName": "Rykov",
        //        "firstName": "Serge",
        //        "isOwner": false,
        //        "isDriver": true,
        //        "isAdmin": false,
        //        "shortName": "SergeR",
        //        "id": "55a6600d2944b0bd1536414e"
        //    },
        //    url = 'http://outset-shadow.elasticbeanstalk.com/api/profiles/55a6600d2944b0bd1536414e';
        //
        //
        //    $httpBackend.whenGET(url).respond(profileSample);
        //
        //    //expect a get request to "/api/profiles/"
        //    $httpBackend.expectGET(url);
        //
        //    // Run controller functionality
        //    ProfileCtrl.getProfile();
        //
        //    $httpBackend.flush();
        //
        //    // Test scope value
        //    expect(ProfileCtrl.profileData).toEqualData(profileSample);
        //});

        //it('should get and set Profile Data for selected user ', function() {
        //    var ids = ['55a6600d2944b0bd1536414e', '55a6600d2944b0bd1536414e'],
        //        profilesEndPoint = 'http://outset-shadow.elasticbeanstalk.com/api/profiles/',
        //        url;
        //
        //    // loop through the ids
        //    for(var i = 0; i < ids.length; i++){
        //        url = profilesEndPoint + ids[i];
        //
        //        $httpBackend.whenGET(url).respond({id: ids[i]});
        //
        //        //expect a get request to "/api/profiles/"
        //        $httpBackend.expectGET(url);
        //
        //        // Run controller functionality
        //        ProfileCtrl.me();
        //
        //        $httpBackend.flush();
        //
        //        expect(ProfileCtrl.profileData.id).toBe(ids[i]);
        //    }
        //
        //});

        it('should contain endorsements map', function() {
            var endorsementsMap = ProfileCtrl.endorsementsMap;
            expect(endorsementsMap).toBeDefined();
        });

        it('profileData should return promise', function() {
            expect(ProfileCtrl.profileData.then).toBeTruthy();
        });
    });
}());
