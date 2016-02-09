var capture = require('../screenshot'),
    ActivityObject = require('./activity.pageObject'),
    activityObj = new ActivityObject;

describe('activity page', function () {

    beforeEach(function () {
        browser.ignoreSynchronization = true;
    });

    afterEach(function () {
        var spec = jasmine.getEnv().currentSpec;
        capture.takeScreenshotOnFailure(spec);
        browser.sleep(3000)
    });

    it('should allow a user to login and navigate to `ACTIVITY`', function () {
        activityObj.login();
        browser.sleep(1000);
        activityObj.activityFootTab.click();
        browser.sleep(500);
        expect(browser.getCurrentUrl()).toBe(activityObj.activityUrl);
        expect(activityObj.addActivityButton.isDisplayed()).toBeTruthy();
    });

    it('should allow the user to toggle between `Activity` and `My Logs`', function () {
        activityObj.activityChevron.click();
        browser.sleep(500);
        expect(activityObj.myLogsChevron).toBeTruthy();
        browser.sleep(500);
        activityObj.myLogsChevron.click();
        browser.sleep(500);
        expect(activityObj.activityChevron.isDisplayed()).toBeTruthy();
    });


    it('should navigate to the `Add Activity` page when the `Add Activity` button is pressed', function () {
        activityObj.addActivityButton.click();
        browser.sleep(1500);
        expect(activityObj.addActivityBanner.isDisplayed()).toBeTruthy();
    });

    it('should allow the user to navigate back to `Activity` root by pressing the `Cancel` button', function () {
        browser.sleep(10000)
        activityObj.cancelButton.click();
        browser.sleep(1500);
        expect(activityObj.addActivityButton.isDisplayed()).toBeTruthy();

    });

    it('should navigate to the `Add Activity` page when the `+ New` banner tab is pressed', function () {
        activityObj.addActivityTab.click();
        browser.sleep(10000);
        expect(activityObj.addActivityBanner.isDisplayed()).toBeTruthy();
    });

    it('should disable `Post Your Drive` footer button if `Title` field has not been filled', function () {
        expect(activityObj.postYourDriveButton.getAttribute('disabled')).toBeTruthy();
    });

    it('should redirect to `friends` when the `Friends` header tab is pressed', function () {
        activityObj.cancelButton.click();
        browser.sleep(1500)
        activityObj.friendsButton.click();
        browser.sleep(1500);
        expect(browser.getCurrentUrl()).toBe(activityObj.friendsUrl);
    });
});