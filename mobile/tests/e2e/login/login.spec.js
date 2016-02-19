var capture = require('../screenshot'),
    LoginObject = require('./login.pageObject');

var loginObject = new LoginObject;

describe('login page', function () {

    beforeEach(function () {
        // browser.ignoreSynchronization = true;
        browser.get('/#/login');
        // browser.sleep(1500);
        // browser.refresh();
        // browser.sleep(3000)
    });

    afterEach(function () {
        var spec = jasmine.getEnv().currentSpec;
        capture.takeScreenshotOnFailure(spec);
    });

    it('should prevent user from entering invalid email string on login', function () {
        loginObject.emailField.sendKeys('thisIsNotAnEmail');
        // browser.sleep(1500)
        loginObject.loginButton.click();
        // browser.sleep(1500);
        expect(loginObject.error.isDisplayed()).toBeTruthy();
    });

    it('should show the user an error message on wrong email_password combo', function () {
        loginObject.emailField.sendKeys('james123456789@outsettruckerline.com');
        loginObject.passwordField.sendKeys('123456789');
        // browser.sleep(1500);
        loginObject.loginButton.click();
        // browser.sleep(1500);
        expect(loginObject.error.isDisplayed()).toBeTruthy();
    });

    // FIX ME - this test is duplicate from `profile.spec.js`
    // it('should allow a user to continue to `profile` upon entry of valid credentials', function(){})
    
})
