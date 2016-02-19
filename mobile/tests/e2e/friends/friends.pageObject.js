module.exports = FriendsObject;

function FriendsObject() {

    // buttons
    this.friendsButton = $$('[ng-click="vm.showFriends($event);"]').get(0);
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

        var email = alpha[rand()] + alpha[rand()] + alpha[rand()] + alpha[rand()] + alpha[rand()] + '@truckerline.com';
        return email;
    }
}
