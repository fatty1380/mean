(function () {
    'use strict';

    describe("Lockbox Service:", function() {

        // mock app module
        beforeEach(module(AppConfig.appModuleName));

        // test module to contain lockboxDocuments
        it('should contain a lockboxDocuments', inject(function (lockboxDocuments) {
            expect(lockboxDocuments).toBeDefined();
        }));

        // test module to contain lockboxDocuments
        it('should contain a docs array', inject(function (lockboxDocuments) {
            expect(lockboxDocuments.docs.length).toBeTruthy();
        }));

        // test module to contain addDocsPopup method
        it('should contain a addDocsPopup', inject(function (lockboxDocuments) {
            expect(lockboxDocuments.addDocsPopup).toBeDefined();
        }));

    });

})();
