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
    this.photoIcon = $('[ng-click="vm.showEditAvatar()"]');
    this.photoModal = $('.action-sheet-title');

    this.editProfileButton = element(by.buttonText('Edit'));
    this.editProfileTitle = element(by.cssContainingText('.title', 'Edit Profile'));

    this.pinInput = element(by.model('data.pin'));
    this.shareProfileEmailInput = element(by.model('vm.contact.email'));
    
    this.shareSuccessModal = element(by.cssContainingText('.popup-title', 'Success'));

    // login script
    this.login = function () {
        browser.get('http://localhost:8100/#/login');
        browser.sleep(3000);
        browser.refresh();
        element(by.model('vm.user.email')).sendKeys('himeexcelanta@gmail.com');
        element(by.model('vm.user.password')).sendKeys('jibajaba');
        element(by.buttonText('Login')).click();
    }
}

