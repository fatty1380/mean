module.exports = FriendsObject;

function FriendsObject() {

    // buttons
    this.friendsButton = $('[ng-click="vm.showFriends();"]');
    this.inviteFriendsButton = $('[ng-click="vm.showAddFriendsModal()"]');
    this.addFriendButton = element(by.buttonText('Add'));
    this.closeButton = element(by.buttonText('Close'));

    // urls
    this.friendsUrl = browser.baseUrl + '/#/account/profile//friends';
    this.profileUrl = browser.baseUrl + '/#/account/profile/';
    
    // misc page objects
    this.chooseFromContacts = element(by.cssContainingText('.title', 'Enter a Mobile Phone or Email Address below'));
    this.contactPhone = element(by.model('vm.contact.phone'));
    this.contactEmail = element(by.model('vm.contact.email'));
    this.contactName = element(by.model('vm.contact.displayName'));
    
    
    // FIX ME - abstract new user logic out to common method
    // buttons/urls for new user pathway - could use `var` if elements need not be exposed
    var registerUrl = browser.baseUrl + '/#/signup/register';
    this.createAcctButton = element(by.buttonText('Create Account'));
    this.licenseContinueButton = $('[ng-click="vm.save()"]');
    this.engagementContinueButton = $('[ng-click="vm.continue()"]');
    this.trucksContinueButton = $('[ng-click="vm.continueToTrailers(true)"]');
    this.trailersContinueButton = $('[ng-click="vm.continue(true)"]');
    this.skipButton = $('[ng-click="vm.skipToProfile();"]');
    this.acknowledgeButton = $('[ng-click="vm.acknowledge();"]');

    function fillRandomFields() {
        function rand() { return Math.floor(Math.random() * alpha.length) };

        var alpha = 'abcdefghijklmnopqrstuvwxyz1234567890'.split('');
        var email = alpha[rand()] + alpha[rand()] + alpha[rand()] + alpha[rand()] + alpha[rand()] + '@truckerline.com';

        element(by.model('vm.user.firstName')).sendKeys('Joe');
        element(by.model('vm.user.lastName')).sendKeys('Truckerline');
        element(by.model('vm.user.email')).sendKeys(email);
        element(by.model('vm.user.password')).sendKeys('truckerline123');
        element(by.model('vm.user.confirmPassword')).sendKeys('truckerline123');
    }

    this.newUserInit = function () {
        browser.get(registerUrl);
        browser.sleep(3000);
        browser.refresh();
        browser.sleep(3000)
        fillRandomFields();
        browser.sleep(1500);
        this.createAcctButton.click();
        browser.sleep(1500);
        this.licenseContinueButton.click();
        browser.sleep(1500);
        this.engagementContinueButton.click();
        browser.sleep(1500);
        this.trucksContinueButton.click();
        browser.sleep(1500);
        this.trailersContinueButton.click();
        browser.sleep(1500);
        this.skipButton.click();
        browser.sleep(1500);
        this.acknowledgeButton.click();     
    };
}
