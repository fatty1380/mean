var capture = require('../screenshot'),
    FriendsObject = require('./friends.pageObject'),
    friendsObj = new FriendsObject;

describe('activity page', function () {

    beforeEach(function () {
    });

    afterEach(function () {
        var spec = jasmine.getEnv().currentSpec;
    });

    it('should allow the user to navigate to the `friends` page', function () {
        friendsObj.newUserInit();
        friendsObj.friendsButton.click();
        
        // assertions
        expect(browser.getCurrentUrl()).toBe(friendsObj.friendsUrl);
    });

    it('should allow the user to access the `Invite Friends` view', function () {
        friendsObj.inviteFriendsButton.click();
        
        // assertions
        expect(friendsObj.chooseFromContacts.isDisplayed()).toBeTruthy();
        expect(friendsObj.contactPhone.isDisplayed()).toBeTruthy();
        expect(friendsObj.contactEmail.isDisplayed()).toBeTruthy();
        expect(friendsObj.contactName.isDisplayed()).toBeTruthy();
    });

    it('should not allow the user to add a friend if any fields are empty', function () {
        expect(friendsObj.addFriendButton.getAttribute('disabled')).toBeTruthy();
    });

    it('should allow the user to send a friend request and exit from the modal', function () {
        friendsObj.contactPhone.sendKeys('415415415');
        friendsObj.contactEmail.sendKeys('joetruckerline@joetruckerline.com');
        friendsObj.contactName.sendKeys('Joe Truckerline');
        friendsObj.addFriendButton.click();
        
        // assertions
        expect(friendsObj.chooseFromContacts.isPresent()).toBeFalsy();
        expect(friendsObj.contactPhone.isPresent()).toBeFalsy();
        expect(friendsObj.contactEmail.isPresent()).toBeFalsy();
        expect(friendsObj.contactName.isPresent()).toBeFalsy();
    });
    
    it('should allow the user to click `Close` and be returned to the `profile` page', function () {
        friendsObj.closeButton.click();
        
        // assertions
        expect(browser.getCurrentUrl()).toBe(friendsObj.profileUrl);
    });
})
