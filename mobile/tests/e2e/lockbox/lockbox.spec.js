var capture = require('../screenshot'),
    LockboxObject = require('./lockbox.pageObject'),
    lockboxObj = new LockboxObject;

describe('lockbox page', function () {

    beforeEach(function () {
        browser.ignoreSynchronization = true;
    });

    afterEach(function () {
        var spec = jasmine.getEnv().currentSpec;
        capture.takeScreenshotOnFailure(spec);
        browser.sleep(3000);
    });

    it('should create a new user, and navigate to the lockbox page', function () {
        // clears cache to allow for succesfull redirect to home from logged-in state
        // browser.executeScript('window.sessionStorage.clear();');
        // browser.executeScript('window.localStorage.clear();');
        browser.sleep(3000);
        lockboxObj.newUserLockboxInit();
        browser.sleep(6000);
        expect(lockboxObj.pinInput.isDisplayed()).toBeTruthy();
    });

    it('should allow the user to create a new PIN', function () {
        lockboxObj.pinInput.sendKeys('1234');
        browser.sleep(1500);
        lockboxObj.pinInput.sendKeys('1234');
        browser.sleep(1500);
        expect(lockboxObj.secureLockboxMessage.isDisplayed()).toBeTruthy();
        lockboxObj.acknowledgeButton.click();
    });


    it('should show the photo modal upon clicking `Add` next to `CDL`', function () {
        expect(lockboxObj.mvrBackgroundElem.isDisplayed()).toBeTruthy();
        browser.sleep(1500);
        lockboxObj.addCdlButton.click();
        browser.sleep(3000);
        lockboxObj.acknowledgeButton.click();
        browser.sleep(3000);
        expect(lockboxObj.photoModal.isDisplayed()).toBeTruthy();
        lockboxObj.cancelButton.click();
        browser.sleep(3000);
    });

    it('should show the photo modal upon clicking `Add` next to `Resume`', function () {
        lockboxObj.addResumeButton.click();
        browser.sleep(3000);
        lockboxObj.acknowledgeButton.click();
        browser.sleep(3000);
        expect(lockboxObj.photoModal.isDisplayed()).toBeTruthy();
        lockboxObj.cancelButton.click();
        browser.sleep(3000);
    });

    it('should show the photo modal upon clicking `Add` next to `Insurance`', function () {
        lockboxObj.addInsuranceButton.click();
        browser.sleep(3000);
        lockboxObj.acknowledgeButton.click();
        browser.sleep(3000);
        expect(lockboxObj.photoModal.isDisplayed()).toBeTruthy();
        lockboxObj.cancelButton.click();
        browser.sleep(3000);
    });
    
    
    it('should show the photo modal upon clicking `Add` next to `other document ...`', function () {
        lockboxObj.addOtherDocButton.click();
        browser.sleep(3000);
        lockboxObj.acknowledgeButton.click();
        browser.sleep(3000);
        expect(lockboxObj.photoModal.isDisplayed()).toBeTruthy();
        lockboxObj.cancelButton.click();
        browser.sleep(3000);
    });

});

//press 'Order'
// expect ('unique DOM element to be present')


// press 'Add'
// press 'Continue'
// expect ('unique DOM item to be present')