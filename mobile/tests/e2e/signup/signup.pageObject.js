module.exports = SignupObject;

function SignupObject() {
    // fields
    this.firstNameField = element(by.model('vm.user.firstName'));
    this.lastNameField = element(by.model('vm.user.lastName'));
    this.emailField = element(by.model('vm.user.email'));
    this.passField = element(by.model('vm.user.password'));
    this.passConfirmField = element(by.model('vm.user.confirmPassword'));
    
    this.handleField = element(by.model('vm.user.handle'));
    
    this.inputFields = element.all(by.css('.item-input'));
    
    // urls
    this.registerUrl = browser.baseUrl + '/#/signup/register';
    this.introUrl = browser.baseUrl + '/#/signup/intro';
    this.handleUrl = browser.baseUrl + '/#/signup/handle';
    this.licenseUrl = browser.baseUrl + '/#/signup/license';
    this.endorsementsUrl = browser.baseUrl + '/#/signup/endorsements';
    this.milesUrl = browser.baseUrl + '/#/signup/miles';
    this.yearsUrl = browser.baseUrl + '/#/signup/years';
    this.ownOpUrl = browser.baseUrl + '/#/signup/own-op';
    this.trucksUrl = browser.baseUrl + '/#/signup/trucks';
    this.trailersUrl = browser.baseUrl + '/#/signup/trailers';
    this.trailersUrl = browser.baseUrl + '/#/signup/photo';
    this.completeUrl = browser.baseUrl + '/#/signup/complete';
    
    
    this.engagementUrl = browser.baseUrl + '/#/signup/engagement';
    this.friendsUrl = browser.baseUrl + '/#/signup/friends';
    this.profileUrl = browser.baseUrl + '/#/account/profile/';
    
    // buttons
    this.createAcctButton = element(by.buttonText('Create Account'));
    this.okButton = element(by.buttonText('OK'));
    // button selectors are not working, and `continue` button calls different methods on each page of registration
    this.continueButton = $('[ng-click="vm.next()"]');
    this.showResumeButton = element(by.buttonText('show me my resume'));
    
    // this.licenseContinueButton = $('[ng-click="vm.save()"]');
    // this.engagementContinueButton = $('[ng-click="vm.continue()"]');
    // this.trucksContinueButton = $('[ng-click="vm.continueToTrailers(true)"]');
    // this.trailersContinueButton = $('[ng-click="vm.continue(true)"]');
    // this.skipButton = $('[ng-click="vm.skipToProfile();"]');
    // this.acknowledgeButton = $('[ng-click="vm.acknowledge();"]')
    
    // misc page objects
    this.chooseYourTruck = element(by.cssContainingText('.big-lineheight', 'What type of truck do you drive?'));
    this.chooseYourTrailer = element(by.cssContainingText('.big-lineheight', 'What type of trailers do you tow?'));
    this.showEditAvatar = $('[ng-click="vm.showEditAvatar()"]');
    
    
    this.endorsementsScreen = $('.endorsement-screen');
    
    this.buildResumeText = element(by.cssContainingText('.big-lineheight', 'Time to build your Resume!'));
    this.cbHandle = element(by.model('vm.handle'));
    this.addFriends = element(by.cssContainingText('.title', 'Add Friends and Grow your Convoy!'));
    
    // errors/popus
    this.error = element(by.css('.error'));
    this.regFailPopup = element(by.cssContainingText('.popup-title', 'Registration Failed'));
    
    // `this.email` will be used to store an existing user's email to test for registration with existing email
    this.email;

    this.fillRandomFields = function (email) {
        
        function rand() { return Math.floor(Math.random() * alpha.length) };

        var alpha = 'abcdefghijklmnopqrstuvwxyz123456890'.split('');

        this.email = email || alpha[rand()] + alpha[rand()] + alpha[rand()] + alpha[rand()] + alpha[rand()] + '@test.com';

        // this.firstNameField.sendKeys('Test');
        // this.lastNameField.sendKeys('Test');
        
        var vm = this;
        
        return vm.emailField.sendKeys(vm.email)
            .then(function () {
                return vm.passField.sendKeys('test1243');
            })
            .then(function () {
                return vm.passConfirmField.sendKeys('test1243');
            });
        // this.emailField.sendKeys(this.email);
        // this.passField.sendKeys('truckerline123');
        // this.passConfirmField.sendKeys('truckerline123');
    };
}
