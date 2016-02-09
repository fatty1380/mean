var capture = require('../screenshot'),
    HomeObject = require('./home.pageObject');

var homeObj = new HomeObject;

// FIX ME on error checking, should ideally test for existence of specific error message, rather than 

describe('home page', function () {

    beforeEach(function () {
        browser.ignoreSynchronization = true;
        browser.get(homeObj.homeUrl);
        browser.sleep(3000);
        // clears cache to allow for succesfull redirect to home from logged-in state
        browser.executeScript('window.sessionStorage.clear();');
        browser.executeScript('window.localStorage.clear();');
        browser.refresh();
        browser.sleep(3000);
    });
    
    // afterEach takes screenshots of application after each failed test
    afterEach(function () {
        var spec = jasmine.getEnv().currentSpec;
        capture.takeScreenshotOnFailure(spec);
    });

    it('should show the `signup` and `login` buttons', function () {

        browser.sleep(3000);
        expect(homeObj.loginButton.isDisplayed()).toBeTruthy();
        expect(homeObj.signupButton.isDisplayed()).toBeTruthy();
    });

    it('should be able to get to the login screen after login button clicked', function () {
        homeObj.loginButton.click();
        browser.sleep(1500);
        expect(homeObj.inputFields.count()).toEqual(2);
        expect(homeObj.emailField.isDisplayed()).toBeTruthy();
    });

    it('should be able to get to the signup screen after signup button clicked', function () {
        homeObj.signupButton.click();
        browser.sleep(1500);
        expect(homeObj.inputFields.count()).toEqual(5);
        expect(homeObj.firstName.isDisplayed()).toBeTruthy();
    });
});
