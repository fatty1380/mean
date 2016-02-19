(function () {
    'use strict';

    describe('Lockbox Service:', function () {

        // mock app module
        beforeEach(module(AppConfig.appModuleName));

        // test module to contain lockboxDocuments
        it('should contain a lockboxDocuments', inject(function (lockboxDocuments) {
            expect(lockboxDocuments).toBeDefined();
        }));

        // test module to contain lockboxDocuments
        it('should return promise', inject(function (lockboxDocuments) {
            expect(lockboxDocuments.getDocuments().then).toBeTruthy();
        }));

        // test module to contain lockboxDocuments
        it('should return an array, not data', inject(function (lockboxDocuments) {
            return lockboxDocuments.getDocuments().then(
                function (docs) {
                    expect(docs).toBeArray();
                });
        }));

        // test module to contain addDocsPopup method
        it('should contain a addDocsPopup', inject(function (lockboxDocuments) {
            expect(lockboxDocuments.addDocsPopup).toBeDefined();
        }));

    });

})();
