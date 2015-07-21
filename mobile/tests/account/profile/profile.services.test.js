(function () {
    'use strict';

    describe("Profile Service:", function() {
        // mock profile module
        beforeEach(angular.mock.module('profile'));

        // test module to contain profileService
        it('should contain a profileService', inject(function (profileService) {
            expect(profileService).toBeDefined();
        }));

        // check if service contains getProfileById Method
        it('should contain method getProfile', inject(function (profileService) {
            expect(profileService.getProfile).toBeDefined();
        }));

        it('getProfile should return a promise', inject(function (profileService) {
            expect(profileService.getProfile('55a6600d2944b0bd1536414e').then).toBeDefined();
        }));

    });

})();
