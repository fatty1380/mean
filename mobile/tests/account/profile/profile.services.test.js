(function () {
    'use strict';

    describe('Profile Service:', function () {
        // mock app module
        beforeEach(module(AppConfig.appModuleName));



        // test module to contain reviewService
        it('should contain a reviewService', inject(function (reviewService) {
            expect(reviewService).toBeDefined();
        }));

        // test module to contain getReviewsByUserID method
        it('should contain a getReviewsByUserID', inject(function (reviewService) {
            expect(reviewService.getReviewsByUserID).toBeDefined();
        }));

        // test module to contain postReviewForProfile method
        it('should contain a postReviewForProfile', inject(function (reviewService) {
            expect(reviewService.postReviewForProfile).toBeDefined();
        }));

        // test module to contain getReviewByID method
        it('should contain a getReviewByID', inject(function (reviewService) {
            expect(reviewService.getReviewByID).toBeDefined();
        }));

        // test module to contain updateReviewByID method
        it('should contain a updateReviewByID', inject(function (reviewService) {
            expect(reviewService.updateReviewByID).toBeDefined();
        }));
        // test module to contain deleteReviewByID method
        it('should contain a deleteReviewByID', inject(function (reviewService) {
            expect(reviewService.deleteReviewByID).toBeDefined();
        }));

        // test module to contain friendsService
        it('should contain a friendsService', inject(function (friendsService) {
            expect(friendsService).toBeDefined();
        }));

        // check if service getFriends() returns empty array
        it('should contain method getFriends()', inject(function (friendsService) {
            var arr = friendsService.getFriends();
            expect(arr).toBeEmptyArray();
        }));

    });

})();
