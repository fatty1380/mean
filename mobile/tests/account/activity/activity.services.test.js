(function () {
    'use strict';

    describe("Activity Service: ", function() {

        // mock app module
        beforeEach(module(AppConfig.appModuleName));

        // test module to contain activityService
        it('should contain a activityService', inject(function (activityService) {
            expect(activityService).toBeDefined();
        }));

        // test module to contain getFeed promise
        it('should return getFeed promise', inject(function (activityService) {
            expect(activityService.getFeed().then).toBeDefined();
        }));

        // test module to contain addDocsPopup method
        it('should contain a postFeed method', inject(function (activityService) {
            expect(activityService.postFeed).toBeDefined();
        }));

        it('should return getFeedById promise', inject(function (activityService) {
            expect(activityService.getFeedById(0).then).toBeDefined();
        }));

        it('should return getDistanceBetween promise', inject(function (activityService) {
            expect(activityService.getDistanceBetween({},{}).then).toBeDefined();
        }));

        it('should contain showPopup method', inject(function (activityService) {
            expect(activityService.showPopup).toBeDefined();
        }));

        it('should return getPlaceName promise', inject(function (activityService) {
            expect(activityService.getPlaceName({}).then).toBeDefined();
        }));

    });
})();

