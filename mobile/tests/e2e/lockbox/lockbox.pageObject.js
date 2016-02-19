module.exports = LockboxObject;

function LockboxObject() {
    
    // misc page objects
    this.lockboxFootTab = $$('.tab-nav a').get(1);
    this.pinInput = element(by.model('data.pin'));
    this.secureLockboxMessage = element(by.cssContainingText('.ng-binding', 'Secure Document Lockbox'));
    this.mvrBackgroundElem = element(by.cssContainingText('.ng-binding', 'MVR and Background Checks'));
    this.photoModal = element(by.cssContainingText('.action-sheet-title', 'Choose your photo'));
    
    // urls
    var registerUrl = browser.baseUrl + '/#/signup/register';
    
    // buttons
    this.cancelButton = element(by.buttonText('Cancel'));
    this.orderMvr = element(by.buttonText('Order'));
    
    // `Add` buttons
    var addButtons = element.all(by.buttonText('Add'));
    this.addCdlButton = addButtons.get(0);
    this.addResumeButton = addButtons.get(1);
    this.addInsuranceButton = addButtons.get(2);
    this.addOtherDocButton = addButtons.get(3);
 
    // FIX ME - abstract new user logic  out to common method
    // buttons for new user pathway - could use `var` if elements need not be exposed
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
