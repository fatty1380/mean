var capture = require('../screenshot'),
    SignupObject = require('./signup.pageObject')
    signupObj = new SignupObject;



describe('home page', function () {

    beforeEach(function () {
        browser.ignoreSynchronization = false;
    });
    
    // afterEach takes screenshots of application after each failed test
    afterEach(function () {
        var spec = jasmine.getEnv().currentSpec;
        capture.takeScreenshotOnFailure(spec);
        browser.sleep(3000);
    });

    it('should not be able to signup a user if any fields are empty', function () {
        browser.get(signupObj.registerUrl);
        signupObj.firstNameField.clear();
        expect(signupObj.createAcctButton.getAttribute('disabled')).toBeTruthy();
    });

    it('should show the `Registration Failed` modal if a user attempts to sign up with existing credentials', function () {
        browser.get(signupObj.registerUrl);
        signupObj.fillRandomFields();
        signupObj.createAcctButton.click();
        browser.sleep(3000);
        browser.get(signupObj.registerUrl);
        browser.sleep(3000)
        signupObj.fillRandomFields(signupObj.email);
        signupObj.createAcctButton.click();
        browser.sleep(3000)
        expect(signupObj.regFailPopup).toBeTruthy();
        browser.refresh();;
    });

    it('should redirect to `#-signup-license` after `Create Account` button is clicked with valid credentials', function () {
        
        browser.sleep(5000)
        signupObj.fillRandomFields();
        browser.sleep(3000)
        signupObj.createAcctButton.click();
        browser.sleep(1500)
        expect(browser.getCurrentUrl()).toBe(signupObj.licenseUrl);
        expect(signupObj.licenseContent).toBeTruthy();
    });
    
    // // FIX ME - will test filling out profile info in another test route
    it('should allow the user to continue to the `engagement` page from the `license` page without filling out any fields', function () {
        signupObj.licenseContinueButton.click();
        browser.sleep(1500);
        expect(browser.getCurrentUrl()).toBe(signupObj.engagementUrl);
        expect(signupObj.cbHandle).toBeTruthy();
    });

    it('should allow the user to continue to the `trucks` page from the `engagement` page without filling out any fields', function () {
        browser.sleep(1500)
        signupObj.engagementContinueButton.click();
        browser.sleep(1500);
        expect(browser.getCurrentUrl()).toBe(signupObj.trucksUrl);
        expect(signupObj.chooseYourTruck).toBeTruthy();
    });

    it('should allow the user to continue to the `trailers` page from the `trucks` page without filling out any fields', function () {
        signupObj.trucksContinueButton.click();
        browser.sleep(1500);
        expect(browser.getCurrentUrl()).toBe(signupObj.trailersUrl);
        expect(signupObj.chooseYourTrailer).toBeTruthy();
    });
    
    
    it('should allow the user to continue to the `friends` page from the `trailers` page without filling out any fields', function () {
        signupObj.trailersContinueButton.click();
        browser.sleep(1500);
        expect(browser.getCurrentUrl()).toBe(signupObj.friendsUrl);
        expect(signupObj.addFriends).toBeTruthy();
    });
    
    it('should allow the user to press `skip` and continue to the `profile` page', function () {
        browser.ignoreSynchronization = true;
        signupObj.skipButton.click();
        browser.sleep(3000);
        expect(browser.getCurrentUrl()).toBe(signupObj.profileUrl);
    });
});
