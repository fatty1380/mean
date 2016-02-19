module.exports = ProfileObject;

function ProfileObject() { 
    // urls
    this.profileUrl = browser.baseUrl + '/#/account/profile/';
    this.lockboxUrl = browser.baseUrl + '/#/account/lockbox';
    this.activityUrl = browser.baseUrl + '/#/account/activity';
    this.messageUrl = browser.baseUrl + '/#/account/messages';
    // FIX ME - not sure if double slash in `/#/account/profile//friends` is intentional or an error
    this.friendUrl = browser.baseUrl + '/#/account/profile//friends';
    
    // general buttons
    this.shareButton = element.all(by.buttonText('Share')).get(0);
    this.cancelButton = element(by.buttonText('Cancel'));
    this.closeButton = element(by.partialButtonText('Close'));
    this.reqReviewButton = element(by.buttonText('Request Review'));
    this.addExpButton = element(by.partialButtonText('Experience'));
    this.activityButton = element(by.buttonText('Add Activity'));
    this.newMessageButton = element(by.buttonText('New Message'));
    this.friendButton = $('.contacts-amount');
    this.shareProfileButton = $('[ng-click="vm.showShareModal()"]');
    this.chooseFromContactsButton = $('[ng-click="vm.pickContact();"]');
    this.shareDocsButton = $('[ng-click="vm.shareDocuments()"]');
    this.shareDocsOkButton = $('[ng-click="$buttonTapped(button, $event)"]');
    this.acknowledgeButton = $('[ng-click="vm.acknowledge();"]');
    
    // footer and header tab clickable elements
    var tabNav = $$('.tab-nav a');
    this.reviewHeadTab = tabNav.get(4);
    this.profileHeadTab = tabNav.get(5);
    this.expHeadTab = tabNav.get(6);
    this.lockboxFootTab = tabNav.get(1);
    this.activityFootTab = tabNav.get(2);
    this.messagesFootTab = tabNav.get(3);
    this.profileFootTab = tabNav.get(0); 
    
    // misc DOM elements
    // this.photoIcon = $('.photo');
    this.photoIcon = $$('[ng-click="vm.showEditAvatar()"]').get(0)
    this.photoModal = $('.action-sheet-title');

    this.editProfileButton = element(by.buttonText('Edit'));
    this.editProfileTitle = element(by.cssContainingText('.title', 'Edit Profile'));

    this.pinInput = element(by.model('data.pin'));
    this.shareProfileEmailInput = element(by.model('vm.contact.email'));

    this.shareSuccessModal = element(by.cssContainingText('.popup-title', 'Success'));


    // FIX ME - abstract new user logic out to common method
    // buttons/urls for new user pathway - could use `var` if elements need not be exposed
    this.registerUrl = browser.baseUrl + '/#/signup/register';
    this.createAcctButton = element(by.buttonText('Create Account'));
    this.licenseContinueButton = $('[ng-click="vm.save()"]');
    this.engagementContinueButton = $('[ng-click="vm.continue()"]');
    this.trucksContinueButton = $('[ng-click="vm.continueToTrailers(true)"]');
    this.trailersContinueButton = $('[ng-click="vm.continue(true)"]');
    this.skipButton = $('[ng-click="vm.skipToProfile();"]');
    this.acknowledgeButton = $('[ng-click="vm.acknowledge();"]');

    // function fillRandomFields() {
    //     function rand() { return Math.floor(Math.random() * alpha.length) };

    //     var alpha = 'abcdefghijklmnopqrstuvwxyz1234567890'.split('');
    //     var email = alpha[rand()] + alpha[rand()] + alpha[rand()] + alpha[rand()] + alpha[rand()] + '@truckerline.com';

    //     element(by.model('vm.user.firstName')).sendKeys('Joe');
    //     element(by.model('vm.user.lastName')).sendKeys('Truckerline');
    //     element(by.model('vm.user.email')).sendKeys(email);
    //     element(by.model('vm.user.password')).sendKeys('truckerline123');
    //     return element(by.model('vm.user.confirmPassword')).sendKeys('truckerline123');
    // }
    
    this.newUserInit = function () {
        var vm = this;
        
        return browser.get(this.registerUrl)
            .then(function () {
               return fillRandomFields() 
            })
        
            .then(function () {
                vm.createAcctButton.click();
                // browser.sleep(3000);
                vm.licenseContinueButton.click();
                // browser.sleep(3000);
                vm.engagementContinueButton.click();
                // browser.sleep(3000);
                vm.trucksContinueButton.click();
                // browser.sleep(3000);
                vm.trailersContinueButton.click();
                // browser.sleep(3000);
                vm.skipButton.click();
                // browser.sleep(3000);
                vm.acknowledgeButton.click();
            })
            .then(function () {

                console.log('this hsould run second')

            })
    };



    function fillRandomFields () {

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
                console.log('this should run first')
                return element(by.model('vm.user.confirmPassword')).sendKeys('truckerline123');

            })
            
            
            
        // console.log('first')
        // element(by.model('vm.user.firstName')).sendKeys('Joe');
        // element(by.model('vm.user.lastName')).sendKeys('Truckerline');
        // element(by.model('vm.user.email')).sendKeys(genRandEmail());
        // element(by.model('vm.user.password')).sendKeys('truckerline123');
        // element(by.model('vm.user.confirmPassword')).sendKeys('truckerline123');
    };

    function genRandEmail() {

        function rand() { return Math.floor(Math.random() * alpha.length) };

        var alpha = 'abcdefghijklmnopqrstuvwxyz1234567890'.split('');
        var email = alpha[rand()] + alpha[rand()] + alpha[rand()] + alpha[rand()] + alpha[rand()] + '@truckerline.com';
        return email;
    }

    // this.newUserInit = function () {
    //     return browser.get(registerUrl)
    //         .then(function () {
    //             return fillRandomFields();
    //         }) 
    //         .then(function (promise) {
    //             console.log('this should be the promise: ', promise)
    //             return this.createAcctButton.click();
    //         })
    //         // .then(function () {
    //         //     return this.licenseContinueButton.click();
    //         // })
    //         // .then(function () {
    //         //     return this.engagementContinueButton.click();
    //         // })
    //         // .then(function () {
    //         //     return this.trucksContinueButton.click();
    //         // })
    //         // .then(function () {
    //         //     return this.trailersContinueButton.click();
    //         // })
    //         // .then(function () {
    //         //     return this.skipButton.click();
    //         // })
    //         // .then(function () {
    //         //     return this.acknowledgeButton.click();
    //         // })



    // };


    
}

