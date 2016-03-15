// var capture = require('../screenshot'),
var SignupObject = require('./signup.pageObject')
var signupObj = new SignupObject;

describe('home page', function() {
    beforeEach(function() { });

    afterEach(function() {
        var spec = jasmine.getEnv().currentSpec;
        // capture.takeScreenshotOnFailure(spec);
    });

    it('should not be able to signup a user if any fields are empty', function() {
        browser.get(signupObj.registerUrl);
        signupObj.emailField.clear();
        expect(signupObj.continueButton.getAttribute('disabled')).toBeTruthy();
    });

    it('should show the `Registration Failed` modal if a user attempts to sign up with existing credentials', function() {
        browser.get(signupObj.registerUrl);
        signupObj.fillRandomFields();
        signupObj.continueButton.click();
        browser.sleep(3000)
        browser.get(signupObj.registerUrl);
        signupObj.fillRandomFields(signupObj.email);
        browser.sleep(3000)
        signupObj.continueButton.click();
        browser.sleep(3000)
        expect(signupObj.regFailPopup).toBeTruthy();
    });

    it('should redirect to `signupIntro` after `Create Account` button is clicked with valid credentials', function() {
        browser.get(signupObj.registerUrl);
        signupObj.fillRandomFields();
        signupObj.continueButton.click();
        expect(browser.getCurrentUrl()).toBe(signupObj.introUrl);
        expect(signupObj.buildResumeText.isDisplayed()).toBeTruthy();
    });

    it('should allow the user to continue to the `handle` page from the `signupIntro` page', function() {
        signupObj.continueButton.click();
        expect(browser.getCurrentUrl()).toBe(signupObj.handleUrl);
        expect(signupObj.handleField.isDisplayed()).toBeTruthy();

        ////
        signupObj.firstNameField.sendKeys('testUserFirst');
        signupObj.lastNameField.sendKeys('testUserLast');
        signupObj.handleField.sendKeys('testHandle');
        ///

    });

    it('should allow the user to continue to the `license` page from the `handle` page', function() {
        signupObj.continueButton.click();
        expect(browser.getCurrentUrl()).toBe(signupObj.licenseUrl);

        //
        // FIX ME - need good page object to write assertion for, and should click at least one license button
        //
    });

    it('should allow the user to continue to the `endorsements` page from the `license` page', function() {
        signupObj.continueButton.click();
        expect(browser.getCurrentUrl()).toBe(signupObj.endorsementsUrl);
        //
        // FIX ME - need good page object to write assertion for, and should click at least one license button
        //
    });

    it('should allow the user to continue to the `miles` page from the `endorsements` page', function() {
        signupObj.continueButton.click();
        expect(browser.getCurrentUrl()).toBe(signupObj.milesUrl);
        //
        // FIX ME - need good page object to write assertion for, and should click at least one license button
        //
    });

    it('should allow the user to continue to the `years` page from the `miles` page', function() {
        signupObj.continueButton.click();
        expect(browser.getCurrentUrl()).toBe(signupObj.yearsUrl);
        //
        // FIX ME - need good page object to write assertion for, and should click at least one license button
        //
    });

    it('should allow the user to continue to the `own-op` page from the `years` page', function() {
        signupObj.continueButton.click();
        expect(browser.getCurrentUrl()).toBe(signupObj.ownOpUrl);
        //
        // FIX ME - need good page object to write assertion for, and should click at least one license button
        //
    });

    it('should allow the user to continue to the `trucks` page from the `own-op` page ', function() {
        signupObj.continueButotn.click();
        expect(browser.getCurrentUrl()).toBe(signupObj.trucksUrl);
        expect(signupObj.chooseYourTruck.isDisplayed()).toBeTruthy();
    });

    it('should allow the user to continue to the `trailers` page from the `trucks` page', function() {
        signupObj.continueButton.click();
        expect(browser.getCurrentUrl()).toBe(signupObj.trailersUrl);
        expect(signupObj.chooseYourTrailer).toBeTruthy();
    });

    it('should allow the user to continue to the `photo` page from the `trailers` page', function() {
        signupObj.continueButton.click();
        expect(browser.getCurrentUrl()).toBe(signupObj.photoUrl);
        expect(signupObj.showEditAvatar.isDisplayed()).toBeTruthy();
    });

    it('should allow the user to continue to the `complete` page from the `photo` page', function() {
        signupObj.continueButton.click();
        expect(browser.getCurrentUrl()).toBe(signupObj.completeUrl);
        expect(signupObj.showResumeButton.isDisplayed()).toBeTruthy();
    });

    it('should allow the user to continue to the `complete` page from the `photo` page', function() {
        signupObj.continueButton.click();
        expect(browser.getCurrentUrl()).toBe(signupObj.profileUrl);
    });




//     it('should allow the user to continue to the `engagement` page from the `license` page without filling out any fields', function() {
//         signupObj.licenseContinueButton.click();
//         expect(browser.getCurrentUrl()).toBe(signupObj.engagementUrl);
//         //
//         // FIX ME - need good page object to write assertion for, and should click at least one license button
//         //
//     });
//     it('should allow the user to continue to the `friends` page from the `trailers` page without filling out any fields', function() {
//         signupObj.trailersContinueButton.click();
//         expect(browser.getCurrentUrl()).toBe(signupObj.friendsUrl);
//         expect(signupObj.addFriends).toBeTruthy();
//     });

//     it('should allow the user to press `skip` and continue to the `profile` page', function() {
//         signupObj.skipButtonclick();
//         expect(browser.getCurrentUrl()).toBe(signupObj.profileUrl);
//     });
});
