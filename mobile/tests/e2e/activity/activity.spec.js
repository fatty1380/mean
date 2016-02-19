var capture = require('../screenshot'),
    ActivityObject = require('./activity.pageObject'),
    activityObj = new ActivityObject;

describe('activity page', function () {

    beforeEach(function () { });

    afterEach(function () {
        // var spec = jasmine.getEnv().currentSpec;
        // capture.takeScreenshotOnFailure(spec);
    });

    it('should allow a user to login and navigate to `ACTIVITY`', function () {
        activityObj.newUserInit();
        activityObj.activityFootTab.click();
        
        // assertions
        expect(browser.getCurrentUrl()).toBe(activityObj.activityUrl);
        expect(activityObj.addActivityButton.isDisplayed()).toBeTruthy();
    });

    it('should allow the user to toggle between `Activity` and `My Logs`', function () {
        activityObj.acknowledgeButton.click();
        activityObj.activityChevron.click();
        
        // assertions
        expect(activityObj.myLogsChevron).toBeTruthy();

        activityObj.myLogsChevron.click();
        
        // assertions        
        expect(activityObj.activityChevron.isDisplayed()).toBeTruthy();
    });

    it('should navigate to the `Add Activity` page when the `Add Activity` button is pressed', function () {
        activityObj.addActivityButton.click();
        
        // `browser.sleep(1000)` added due to inconsistent assertion 
        browser.sleep(1000);
        
        // assertions
        expect(activityObj.addActivityBanner.isDisplayed()).toBeTruthy();
    });

    it('should allow the user to navigate back to `Activity` root by pressing the `Cancel` button', function () {
        activityObj.cancelButtonSecondary.click();
        
        // assertions
        expect(activityObj.addActivityButton.isDisplayed()).toBeTruthy();
    });

    it('should navigate to the `Add Activity` page when the `+ New` banner tab is pressed', function () {
        activityObj.addActivityTab.click();
        
        // assertions
        expect(activityObj.addActivityBanner.isDisplayed()).toBeTruthy();
    });

    it('should disable `Post Your Drive` footer button if `Title` field has not been filled', function () {
        expect(activityObj.postYourDriveButton.getAttribute('disabled')).toBeTruthy();
    });

    it('should redirect to `friends` when the `Friends` header tab is pressed', function () {
        activityObj.cancelButtonSecondary.click();
        activityObj.friendsButton.click();
        
        // assertions
        expect(browser.getCurrentUrl()).toBe(activityObj.friendsUrl);
    });
});