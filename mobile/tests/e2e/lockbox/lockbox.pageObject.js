var LoginObj = require('../login/login.pageObject'),
    loginObj = new LoginObj;

module.exports = LockboxObject;

function LockboxObject() {

    // urls
    var registerUrl = browser.baseUrl + '/#/signup/register';
    var loginUrl = browser.baseUrl + '/#/login';
    
    // testUser
    var testUserEmail = 'testUser@test.com';
    var testUserPassword = 'test1234';
    
    // misc page objects
    this.lockboxFootTab = $$('.tab-nav a').get(2);
    this.pinInput = element(by.model('data.pin'));
    this.docInput = element(by.model('data.name'));
    this.photoModal = element(by.cssContainingText('.action-sheet-title', 'Choose your photo'));
    this.previewTitle = element(by.cssContainingText('.title', 'Preview'));
    this.discardChangesModal = element(by.cssContainingText('.popup-title', 'Discard Changes?'));
    
    
    // buttons
    this.takePhotoButton = element(by.buttonText('Take a photo from camera'));
    this.storeDocButton = element(by.buttonText('Store Document'));
    this.cancelButton = element(by.buttonText('Cancel'));
    this.closeButton = element(by.buttonText('Close'));
    this.orderMvrButton = element(by.buttonText('Order Now'));
    this.okButton = element(by.buttonText('OK'));
    this.editLockboxButton = element(by.css('[ng-click="vm.showEditModal()"]'));
    this.backButton = element(by.buttonText('Back'));
    this.docCheckbox = element(by.model('doc.checked'));
    this.deleteDocButton = element(by.buttonText('Delete'));
    this.confirmButton = element(by.buttonText('Confirm'));
    
    // Doc stub buttons
    var stubButtons = element.all(by.css('.button-stub'));
    this.mvrStub = stubButtons.get(0);
    this.resumeStub = stubButtons.get(1);
    this.cdlStub = stubButtons.get(2);
    this.insuranceStub = stubButtons.get(3);
    this.miscStub = stubButtons.get(4);
    
    // Doc buttons
    this.resumeDoc = element(by.cssContainingText('.doc-name.ng-binding', 'Resume'));
    this.abcDoc = element(by.cssContainingText('.doc-name.ng-binding', 'ABC'));
 
    /**
     * TEST USER LOGIN - START
     */
    this.loginTest = function() {
        return browser.get(loginUrl)
            .then(function() {
                return fillLogin();
            })
            .then(function() {
                return loginObj.loginButton.click();
            });
    };

    function fillLogin() {
        return loginObj.emailField.sendKeys(testUserEmail)
            .then(function() {
                return loginObj.passwordField.sendKeys(testUserPassword);
            });
    }
    /**
     * TEST USER LOGIN - END
     */
    
    /**
     * NEW USER SIGNUP - START
     */
    this.createAcctButton = element(by.buttonText('Create Account'));
    this.licenseContinueButton = $('[ng-click="vm.save()"]');
    this.engagementContinueButton = $('[ng-click="vm.continue()"]');
    this.trucksContinueButton = $('[ng-click="vm.continueToTrailers(true)"]');
    this.trailersContinueButton = $('[ng-click="vm.continue(true)"]');
    this.skipButton = $('[ng-click="vm.skipToProfile();"]');
    this.acknowledgeButton = $('[ng-click="vm.acknowledge();"]');

    this.newUserInit = function () {
        var vm = this;

        return browser.get(registerUrl)
            .then(function () {
                return fillRandomFields();
            })
            .then(function () {
                return vm.createAcctButton.click();
            })
            .then(function () {
                return vm.licenseContinueButton.click();
            })
            .then(function () {
                return vm.engagementContinueButton.click();
            })
            .then(function () {
                return vm.trucksContinueButton.click();
            })
            .then(function () {
                return vm.trailersContinueButton.click();
            })
            .then(function () {
                return vm.skipButton.click();
            })
            .then(function () {
                return vm.acknowledgeButton.click();
            });   
    };

    function fillRandomFields() {

        return element(by.model('vm.user.firstName')).sendKeys('Joe')
            .then(function () {
                return element(by.model('vm.user.lastName')).sendKeys('Truckerline');
            })
            .then(function () {
                return element(by.model('vm.user.email')).sendKeys(genRandEmail());
            })
            .then(function () {
                return element(by.model('vm.user.password')).sendKeys('truckerline123');
            })
            .then(function () {
                return element(by.model('vm.user.confirmPassword')).sendKeys('truckerline123');
            });
    }

    function genRandEmail() {
        var alpha = 'abcdefghijklmnopqrstuvwxyz1234567890'.split('');
        function rand() { return Math.floor(Math.random() * alpha.length) };

        var email = alpha[rand()] + alpha[rand()] + alpha[rand()] + alpha[rand()] + alpha[rand()] + '@test.com';
        return email;
    }
    /**
     * NEW USER SIGNUP - END
     */
}
