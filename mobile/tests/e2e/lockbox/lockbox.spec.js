var utils = require('../utils'),
    LockboxObject = require('./lockbox.pageObject'),
    lockboxObj = new LockboxObject;

describe('lockbox page', function() {

    beforeEach(function() { });

    afterEach(function() {
        // var spec = jasmine.getEnv().currentSpec;
        // screenshots wi
    });

    it('should login with test user, and navigate to the lockbox page', function() {
        lockboxObj.loginTest();
        lockboxObj.lockboxFootTab.click();
    });

    it('should allow the user to open and cancel the `MVR & Background Checks` page', function() {
        lockboxObj.mvrStub.click();
        expect(lockboxObj.mvrStub.isPresent()).toBeTruthy();
        lockboxObj.cancelButton.click();
    });

    it('should allow the user to open the `Resume` and cancel the `Choose your Photo` modal', function() {
        lockboxObj.resumeStub.click();
        lockboxObj.acknowledgeButton.click();
        expect(lockboxObj.photoModal.isPresent()).toBeTruthy();
        lockboxObj.cancelButton.click();
        expect(lockboxObj.photoModal.isPresent()).toBeFalsy();
        // browser.sleep(3000)
    });

    it('should allow the user to open the `Resume` page, and cancel the `Take a photo from camera` option', function() {
        lockboxObj.resumeStub.click();
        lockboxObj.acknowledgeButton.click();
        lockboxObj.takePhotoButton.click();
        lockboxObj.cancelButton.click();
        expect(lockboxObj.discardChangesModal.isPresent()).toBeTruthy();
        lockboxObj.okButton.click();
        expect(lockboxObj.discardChangesModal.isPresent()).toBeFalsy();

    });

    it('should allow the user to upload a mock document on the `Resume` page', function() {
        lockboxObj.resumeStub.click();
        lockboxObj.acknowledgeButton.click();
        lockboxObj.takePhotoButton.click();
        lockboxObj.storeDocButton.click();
        lockboxObj.pinInput.sendKeys('1234');
        lockboxObj.resumeDoc.click();
        expect(lockboxObj.previewTitle.isPresent()).toBeTruthy();
        lockboxObj.closeButton.click();
    });

    it('should allow the user delete the mock document on the `Resume` page', function() {
        lockboxObj.editLockboxButton.click();
        expect(lockboxObj.pinInput.isPresent()).toBeFalsy();
        lockboxObj.docCheckbox.click();
        lockboxObj.deleteDocButton.click();
        browser.sleep(500);
        lockboxObj.okButton.click();
        expect(lockboxObj.docCheckbox.isPresent()).toBeFalsy();
        lockboxObj.backButton.click();
    })

    it('should allow the user to upload a new document on the `+` page', function() {
        lockboxObj.miscStub.click();
        lockboxObj.takePhotoButton.click();
        lockboxObj.docInput.sendKeys('ABC');
        lockboxObj.confirmButton.click();
        lockboxObj.storeDocButton.click();
        expect(lockboxObj.abcDoc.isPresent()).toBeTruthy();
    });
});
