var capture = require('../screenshot'),
    ProfileObject = require('./profile.pageObject');
profileObj = new ProfileObject;

describe('profile page', function () {

    beforeEach(function () { });

    afterEach(function () {
        var spec = jasmine.getEnv().currentSpec;
    });

    // NOTE - switch to `profileObj.login` to obviate going through new user signup
    it('should redirect the user to the `profile` page upon login with valid credentials', function () {
        profileObj.newUserInit();
        expect(browser.getCurrentUrl()).toBe(profileObj.profileUrl);
        expect(profileObj.photoIcon.isDisplayed()).toBeTruthy();
    });

    it('should redirect to `lockbox` and allow user to return to `profile`', function () {
        profileObj.lockboxFootTab.click();
        expect(browser.getCurrentUrl()).toBe(profileObj.lockboxUrl);
        profileObj.cancelPrimary.click();
        profileObj.acknowledgeButton.click();
        expect(browser.getCurrentUrl()).toBe(profileObj.profileUrl);
    });

    it('should allow the user to click on the `ACTIVITY` footer tab', function () {
        profileObj.activityFootTab.click();
        profileObj.acknowledgeButton.click();
        expect(browser.getCurrentUrl()).toBe(profileObj.activityUrl);
        expect(profileObj.activityButton.isDisplayed()).toBeTruthy();
    });

    it('should allow the user to click on the `MESSAGES` FOOT TAB', function () {
        profileObj.messagesFootTab.click();
        profileObj.acknowledgeButton.click();
        expect(profileObj.newMessageButton.isDisplayed()).toBeTruthy();
        expect(browser.getCurrentUrl()).toBe(profileObj.messageUrl);
    });

    it('should allow the user to click on the `PROFILE` footer tab', function () {
        profileObj.profileFootTab.click();
        expect(profileObj.shareButton.isDisplayed()).toBeTruthy();
        expect(browser.getCurrentUrl()).toBe(profileObj.profileUrl);
    });

    it('should redirect to `friends` and allow the user to return to `profile`', function () {
        profileObj.friendButton.click();
        expect(browser.getCurrentUrl()).toBe(profileObj.friendUrl);
        profileObj.closeButton.click();
    });

    it('should render `Choose your photo` modal when `EditAvatar` is clicked', function () {
        profileObj.photoIcon.click();
        expect(profileObj.photoModal.isDisplayed()).toBeTruthy();
        browser.sleep(1000)
        profileObj.cancelPrimary.click();
    });

    it('should render the `Edit Profile` view when `edit` button is clicked', function () {
        profileObj.editProfileButton.click();
        expect(profileObj.editProfileTitle.isDisplayed()).toBeTruthy();
        profileObj.cancelPrimary.click();
    });
    
    it('should allow the user to enter their pin and to share their profile', function () {
        profileObj.shareProfileButton.click();
        profileObj.shareSkipButton.click();
        expect(profileObj.chooseFromContactsButton.isDisplayed()).toBeTruthy();
    });

    // // FIX ME - not sure why button appears to be `enabled` in this test
    // it('should not allow the user to share their profile if the email field is empty', function () {
    //     profileObj.shareProfileEmailInput.clear();
    //     // expect(profileObj.shareDocsButton.isEnabled()).toBeFalsy();     
    // });

    it('should allow the user to share their profile if the email field is filled', function () {
        profileObj.shareProfileEmailInput.sendKeys('trucker@truckertruckerlineline.com');
        profileObj.shareDocsButton.click();
        expect(profileObj.shareSuccessModal.isDisplayed()).toBeTruthy();
    });

    it('should allow the user to return to the `profile` view after sharing their profile', function () {
        profileObj.shareDocsOkButton.click();
        expect(profileObj.shareProfileButton.isDisplayed()).toBeTruthy();
        expect(browser.isElementPresent(profileObj.shareSuccessModal)).toBe(false);
    });

    it('should allow the user to press `Cancel` to exit pin confirmation when sharing profile', function () {
        profileObj.shareProfileButton.click();
        profileObj.cancelPrimary.click();
    });
});
