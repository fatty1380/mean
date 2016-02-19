module.exports = ActivityObject;

function ActivityObject() {
    
    // buttons
    this.activityFootTab = $$('.tab-nav a').get(2);
    this.postYourDriveButton = element(by.buttonText('Post Your Drive'));
    this.friendsButton = element(by.buttonText('Friends'));

    var addActivityButtons = $$('[ng-click="vm.showAddActivityModal()"]');
    this.addActivityButton = addActivityButtons.get(0);
    this.addActivityTab = addActivityButtons.get(1);

    this.cancelButtonPrimary = $$('[ng-click="vm.cancel()"]').get(0)
    this.cancelButtonSecondary = $$('[ng-click="vm.cancel()"]').get(1)
    
    // misc
    this.activityUrl = browser.baseUrl + '/#/account/activity';
    this.friendsUrl = browser.baseUrl + '/#/account/profile//friends';
    this.addActivityBanner = element(by.cssContainingText('.title', 'Add Activity'));
    this.activityChevron = $('.ion-chevron-down');
    this.myLogsChevron = $('.ion-chevron-up');
    
    // buttons/urls for new user pathway - could use `var` if elements need not be exposed
    this.registerUrl = browser.baseUrl + '/#/signup/register';
    this.createAcctButton = element(by.buttonText('Create Account'));
    this.licenseContinueButton = $('[ng-click="vm.save()"]');
    this.engagementContinueButton = $('[ng-click="vm.continue()"]');
    this.trucksContinueButton = $('[ng-click="vm.continueToTrailers(true)"]');
    this.trailersContinueButton = $('[ng-click="vm.continue(true)"]');
    this.shareSkipButton = $$('[ng-click="vm.skipDocs()"]').get(1)
    this.skipButton = $('[ng-click="vm.skipToProfile();"]');
    this.acknowledgeButton = $('[ng-click="vm.acknowledge();"]');


    this.login = function () {
        return browser.get('http://localhost:8100/#/login')
            .then(function () {
                return element(by.model('vm.user.email')).sendKeys('himeexcelanta@gmail.com');
            })
            .then(function () {
                return element(by.model('vm.user.password')).sendKeys('jibajaba');
            })
            .then(function () {
                return element(by.buttonText('Login')).click();
            });
    };

    this.newUserInit = function () {
        var vm = this;

        return browser.get(this.registerUrl)
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
