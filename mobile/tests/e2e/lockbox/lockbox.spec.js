var capture = require('../screenshot'),
    LockboxObject = require('./lockbox.pageObject'),
    lockboxObj = new LockboxObject;

describe('lockbox page', function () {

    beforeEach(function () { });

    afterEach(function () {
        var spec = jasmine.getEnv().currentSpec;
    });

    it('should create a new user, and navigate to the lockbox page', function () {
        // clears cache to allow for succesfull redirect to home from logged-in state
        // browser.executeScript('window.sessionStorage.clear();');
        // browser.executeScript('window.localStorage.clear();');
        lockboxObj.newUserInit();
        lockboxObj.lockboxFootTab.click();
        
	    // assertions 
        expect(lockboxObj.pinInput.isDisplayed()).toBeTruthy();
    });

    it('should allow the user to create a new PIN', function () {
        lockboxObj.pinInput.sendKeys('1234');
        lockboxObj.pinInput.sendKeys('1234');
        
        // assertions
        expect(lockboxObj.secureLockboxMessage.isDisplayed()).toBeTruthy();
        lockboxObj.acknowledgeButton.click();
    });


    it('should show the photo modal upon clicking `Add` next to `CDL`', function () {
        
        // assertions
        expect(lockboxObj.mvrBackgroundElem.isDisplayed()).toBeTruthy();
        
        lockboxObj.addCdlButton.click();
        lockboxObj.acknowledgeButton.click();
        // assertions
        expect(lockboxObj.photoModal.isDisplayed()).toBeTruthy();
        
        lockboxObj.cancelButton.click();
    });

   it('should show the photo modal upon clicking `Add` next to `Resume`', function () {
        lockboxObj.addResumeButton.click();
        lockboxObj.acknowledgeButton.click();
        
        // assertions
        expect(lockboxObj.photoModal.isDisplayed()).toBeTruthy();
        
        lockboxObj.cancelButton.click();
    });

    it('should show the photo modal upon clicking `Add` next to `Insurance`', function () {
        lockboxObj.addInsuranceButton.click();
        lockboxObj.acknowledgeButton.click();
        
        // assertions
        expect(lockboxObj.photoModal.isDisplayed()).toBeTruthy();
        lockboxObj.cancelButton.click();
    });
    
    
    it('should show the photo modal upon clicking `Add` next to `other document ...`', function () {
        lockboxObj.addOtherDocButton.click();
        lockboxObj.acknowledgeButton.click();
        
        // assertions
        expect(lockboxObj.photoModal.isDisplayed()).toBeTruthy();
        
        lockboxObj.cancelButton.click();
    });
});
