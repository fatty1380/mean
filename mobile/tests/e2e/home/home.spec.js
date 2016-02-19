var capture = require('../screenshot'),
    HomeObject = require('./home.pageObject');

var homeObj = new HomeObject;

describe('home page', function () {

    beforeEach(function () {
        browser.get(homeObj.homeUrl);
        browser.executeScript('window.sessionStorage.clear();');
        browser.executeScript('window.localStorage.clear();');
    });
    
    afterEach(function () {
        var spec = jasmine.getEnv().currentSpec;
        // FIXME - not working
        // capture.takeScreenshotOnFailure(spec);
    });

    it('should show the `signup` and `login` buttons', function () {
        expect(homeObj.loginButton.isDisplayed()).toBeTruthy();
        expect(homeObj.signupButton.isDisplayed()).toBeTruthy();
    });

    it('should be able to get to the login screen after login button clicked', function () {
        homeObj.loginButton.click();
        expect(homeObj.inputFields.count()).toEqual(2);
        expect(homeObj.emailField.isDisplayed()).toBeTruthy();
    });

    it('should be able to get to the signup screen after signup button clicked', function () {
        homeObj.signupButton.click();
        expect(homeObj.inputFields.count()).toEqual(5);
        expect(homeObj.firstName.isDisplayed()).toBeTruthy();
    });
});
