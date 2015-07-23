(function () {
    'use strict';

    describe("Register Service: ", function() {
        // mock profile module
        beforeEach(angular.mock.module('signup'));

        // test module to contain profileService
        it('should contain a registerService', inject(function (registerService) {
            expect(registerService).toBeDefined();
        }));

        // check if service contains getProfileById Method
        it('should contain propery dataProps', inject(function (registerService) {
            expect(registerService.dataProps).toBeDefined();
        }));

        it(' - ', inject(function (registerService, $httpBackend) {
           // $httpBackend.expectGET("http://outset-d.elasticbeanstalk.com/api/users/me")
        }));

    });

})();
