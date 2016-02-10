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

    function fillRandomFields() {
        function rand() { return Math.floor(Math.random() * alpha.length) };

        var alpha = 'abcdefghijklmnopqrstuvwxyz1234567890'.split('');
        var email = alpha[rand()] + alpha[rand()] + alpha[rand()] + alpha[rand()] + alpha[rand()] + '@truckerline.com';

        element(by.model('vm.user.firstName')).sendKeys('Joe');
        element(by.model('vm.user.lastName')).sendKeys('Truckerline');
        element(by.model('vm.user.email')).sendKeys(email);
        element(by.model('vm.user.password')).sendKeys('truckerline123');
        element(by.model('vm.user.confirmPassword')).sendKeys('truckerline123');

    };

    this.newUserLockboxInit = function () {
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
        browser.sleep(1500);
        this.lockboxFootTab.click();
        
    }
}
