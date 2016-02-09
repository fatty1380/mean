module.exports = ActivityObject;

function ActivityObject() {

    // buttons
    this.activityFootTab = $$('.tab-nav a').get(2);
    this.postYourDriveButton = element(by.buttonText('Post Your Drive'));
    this.friendsButton = element(by.buttonText('Friends'));
    
    // will return array of elements linking to `Add Activity` view
    var addActivityButtons = $$('[ng-click="vm.showAddActivityModal()"]');
    this.addActivityButton = addActivityButtons.get(0);
    this.addActivityTab = addActivityButtons.get(1);
    
    this.cancelButton = $('[ng-click="vm.cancel()"]');
    
    // misc
    this.activityUrl = browser.baseUrl + '/#/account/activity';
    this.friendsUrl = browser.baseUrl + '/#/account/profile//friends';
    this.addActivityBanner = element(by.cssContainingText('.title', 'Add Activity'));
    this.activityChevron = $('.ion-chevron-down');
    this.myLogsChevron = $('.ion-chevron-up');

    this.login = function () {
        browser.get('http://localhost:8100/#/login');
        element(by.model('vm.user.email')).sendKeys('himeexcelanta@gmail.com');
        element(by.model('vm.user.password')).sendKeys('jibajaba');
        element(by.buttonText('Login')).click();
    };


}

