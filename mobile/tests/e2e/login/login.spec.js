var capture = require('../screenshot'),
    LoginObject = require('./login.pageObject'),
    loginObject = new LoginObject;

describe('login page', function () {

    beforeEach(function () {
        browser.get(browser.baseUrl + '/#/login');
    });

    afterEach(function () {
        // var spec = jasmine.getEnv().currentSpec;
        // capture.takeScreenshotOnFailure(spec);
    });

    it('should prevent user from entering invalid email string on login', function () {
        loginObject.emailField.sendKeys('thisIsNotAnEmail');
        loginObject.loginButton.click();
        loginObject.loginButton.click();
        
        // assertions
        expect(loginObject.error.isDisplayed()).toBeTruthy();
    });

    it('should show the user an error message on wrong email_password combo', function () {
        loginObject.emailField.sendKeys('james123456789@outsettruckerline.com');
        loginObject.passwordField.sendKeys('123456789');
        loginObject.loginButton.click();        
        
        // assertions
        expect(loginObject.error.isDisplayed()).toBeTruthy();
    });
});
