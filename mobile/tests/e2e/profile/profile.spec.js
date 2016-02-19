var capture = require('../screenshot'),
    ProfileObject = require('./profile.pageObject');
    profileObj = new ProfileObject;

describe('profile page', function () {

    beforeEach(function () { });

    afterEach(function () {
        var spec = jasmine.getEnv().currentSpec;
    });
   
    fit('should redirect the user to the `profile` page upon login with valid credentials', function () {
        // profileObj.newUserInit().then(function () {
        //     // browser.sleep(3000)
        //     expect(browser.getCurrentUrl()).toBe(profileObj.profileUrl);
            
        //     // expect(profileObj.photoIcon.isDisplayed()).toBeTruthy();
            
        // })
        
        profileObj.newUserInit();
        expect(browser.getCurrentUrl()).toBe(profileObj.profileUrl)
        expect(profileObj.photoIcon.isDisplayed()).toBeTruthy();
        // profileObj.login();
  
        // browser.sleep(3000)
        // profileObj.fillRandomFields().then(function (promise) {
        //     console.log('this should be the promise', promise)
        // })
            
            
        // assertions


    });

    it('should allow the user to click on the `REVIEWS` header tab', function () {
        profileObj.reviewHeadTab.click();
        // browser.sleep(1500);
        expect(profileObj.reqReviewButton.isDisplayed()).toBeTruthy();
    });

    it('should allow the user to click on the `PROFILE` header tab', function () {
        profileObj.reviewHeadTab.click();
        // browser.sleep(1500);
        expect(profileObj.reqReviewButton.isDisplayed()).toBeTruthy();
    });
    
    it('should allow the user to click on the `EXPERIENCE` header tab', function () {
        profileObj.reviewHeadTab.click();
        // browser.sleep(1500);
        expect(profileObj.reqReviewButton.isDisplayed()).toBeTruthy();
    });
    
    it('should redirect to `lockbox` and allow user to return to `profile`', function () {
        profileObj.lockboxFootTab.click();
        // browser.sleep(1500);
        expect(browser.getCurrentUrl()).toBe(profileObj.lockboxUrl);
        // browser.sleep(3000);
        profileObj.cancelButton.click();
        // browser.sleep(1500);
        profileObj.acknowledgeButton.click();
        // browser.sleep(3000);
        expect(browser.getCurrentUrl()).toBe(profileObj.profileUrl);
    });
    
    it('should allow the user to click on the `ACTIVITY` footer tab', function () {
        profileObj.activityFootTab.click();
        // browser.sleep(1500);
        profileObj.acknowledgeButton.click();
        // browser.sleep(1500);
        expect(browser.getCurrentUrl()).toBe(profileObj.activityUrl);
        expect(profileObj.activityButton.isDisplayed()).toBeTruthy();
    });
    
    it('should allow the user to click on the `MESSAGES` FOOT TAB', function () {
        profileObj.messagesFootTab.click();
        browser.sleep(6000);
        profileObj.acknowledgeButton.click();
        expect(profileObj.newMessageButton.isDisplayed()).toBeTruthy();
        expect(browser.getCurrentUrl()).toBe(profileObj.messageUrl);
    });
    
    it('should allow the user to click on the `PROFILE` footer tab', function () {
        profileObj.profileFootTab.click();
        // browser.sleep(1500);
        expect(profileObj.shareButton.isDisplayed()).toBeTruthy();
        expect(browser.getCurrentUrl()).toBe(profileObj.profileUrl);
    });
    
    it('should redirect to `friends` and allow the user to return to `profile`', function () {
        // FIX ME - not sure if double slash in `/#/account/profile//friends` is intentional or an error
        profileObj.friendButton.click();
        // browser.sleep(1500);
        expect(browser.getCurrentUrl()).toBe(profileObj.friendUrl);
        profileObj.closeButton.click();
    });
    
    it('should render `Choose your photo` modal when `EditAvatar` is clicked', function () {
        profileObj.photoIcon.click();
        expect(profileObj.photoModal.isDisplayed()).toBeTruthy();
        // browser.sleep(1500);
        profileObj.cancelButton.click();
    });

    it('should render the `Edit Profile` view when `edit` button is clicked', function () {
        profileObj.editProfileButton.click();
        expect(profileObj.editProfileTitle.isDisplayed()).toBeTruthy();
        // browser.sleep(1500);
        profileObj.cancelButton.click();
    });
    
    
    // FIX ME - this test really should be rewritten when state of user's documents can be modified server side...hard to test functionality w/o this
    xit('should allow the user to enter their pin and to share their profile', function () {
        // browser.sleep(3000);
        profileObj.shareProfileButton.click();
        // browser.sleep(3000);
        profileObj.pinInput.sendKeys('1234');
        // browser.sleep(3000);
        expect(profileObj.chooseFromContactsButton.isDisplayed()).toBeTruthy();
    });

    // FIX ME - not sure why button appears to be `enabled` in this test
    xit('should not allow the user to share their profile if the email field is empty', function () {
        profileObj.shareProfileEmailInput.clear();
        // browser.sleep(3000);
        // expect(profileObj.shareDocsButton.isEnabled()).toBe(false);
    });

    xit('should allow the user to share their profile if the email field is filled', function () {
        profileObj.shareProfileEmailInput.sendKeys('trucker@truckertruckerlineline.com');
        // browser.sleep(3000);
        profileObj.shareDocsButton.click();
        // browser.sleep(3000);
        expect(profileObj.shareSuccessModal.isDisplayed()).toBeTruthy();
    });

    xit('should allow the user to return to the `profile` view after sharing their profile', function () {
        profileObj.shareDocsOkButton.click();
        // browser.sleep(3000);
        expect(profileObj.shareProfileButton.isDisplayed()).toBeTruthy();
        expect(browser.isElementPresent(profileObj.shareSuccessModal)).toBe(false);
    });
    
    xit('should allow the user to press `Cancel` to exit pin confirmation when sharing profile', function () {
        profileObj.shareProfileButton.click();
        browser.sleep(6000);
        profileObj.cancelButton.click();
        // browser.sleep(3000);
    });

});
