module.exports = SignupObject;

function SignupObject() {
    // fields
    this.firstNameField = element(by.model('vm.user.firstName'));
    this.lastNameField = element(by.model('vm.user.lastName'));
    this.emailField = element(by.model('vm.user.email'));
    this.passField = element(by.model('vm.user.password'));
    this.passConfirmField = element(by.model('vm.user.confirmPassword'));
    this.inputFields = element.all(by.css('.item-input'));
    
    // urls
    this.registerUrl = browser.baseUrl + '/#/signup/register';
    this.licenseUrl = browser.baseUrl + '/#/signup/license';
    this.engagementUrl = browser.baseUrl + '/#/signup/engagement';
    this.trucksUrl = browser.baseUrl + '/#/signup/trucks';
    this.trailersUrl = browser.baseUrl + '/#/signup/trailers';
    this.friendsUrl = browser.baseUrl + '/#/signup/friends';
    this.profileUrl = browser.baseUrl + '/#/account/profile/';
    
    // buttons
    this.createAcctButton = element(by.buttonText('Create Account'));
    this.okButton = element(by.buttonText('OK'));
    // button selectors are not working, and `continue` button calls different methods on each page of registration
    this.licenseContinueButton = $('[ng-click="vm.save()"]');
    this.engagementContinueButton = $('[ng-click="vm.continue()"]');
    this.trucksContinueButton = $('[ng-click="vm.continueToTrailers(true)"]');
    this.trailersContinueButton = $('[ng-click="vm.continue(true)"]');
    this.skipButton = $('[ng-click="vm.skipToProfile();"]');
    this.acknowledgeButton = $('[ng-click="vm.acknowledge();"]')
    
    // misc page objects
    this.licenseContent = $('.license-content');
    this.cbHandle = element(by.model('vm.handle'));
    this.chooseYourTruck = element(by.cssContainingText('.big-lineheight', 'Choose Your Truck Make'));
    this.chooseYourTrailer = element(by.cssContainingText('.big-lineheight', 'Choose Your Trailer Type'));
    this.addFriends = element(by.cssContainingText('.title', 'Add Friends and Grow your Convoy!'));
    
    // errors/popus
    this.error = element(by.css('.error'));
    this.regFailPopup = element(by.cssContainingText('.popup-title', 'Registration Failed'));
    
    // `this.email` will be used to store an existing user's email to test for registration with existing email
    this.email;

    this.fillRandomFields = function (email) {
        
        function rand() { return Math.floor(Math.random() * alpha.length) };

        var alpha = 'abcdefghijklmnopqrstuvwxyz123456890'.split('');

        this.email = email || alpha[rand()] + alpha[rand()] + alpha[rand()] + alpha[rand()] + alpha[rand()] + '@truckerline.com';

        this.firstNameField.sendKeys('Joe');
        this.lastNameField.sendKeys('Truckerline');
        this.emailField.sendKeys(this.email);
        this.passField.sendKeys('truckerline123');
        this.passConfirmField.sendKeys('truckerline123');
    };
}
