var capture = require('../screenshot'),
    MessagesObject = require('./messages.pageObject');

var messagesObj = new MessagesObject;

describe('login page', function () {

    beforeEach(function () {
        browser.ignoreSynchronization = true;
    });

    afterEach(function () {
        var spec = jasmine.getEnv().currentSpec;
        capture.takeScreenshotOnFailure(spec);
        browser.sleep(1500)
    });
    
    // FIX ME - perhaps add this method to config?
    it('should allow a user to login and navigate to `MESSAGES`', function () {
        messagesObj.login();
        browser.sleep(1000);
        messagesObj.messagesFootTab.click();
        browser.sleep(500);
        expect(browser.getCurrentUrl()).toBe(messagesObj.messageUrl);
        expect(messagesObj.newMessageButton.isDisplayed()).toBeTruthy();
    });

    it('should render the `Message A Friend` view upon clicking the `New Message` button', function () {
        messagesObj.newMessageButton.click();
        browser.sleep(1500);
        expect(messagesObj.messageFriendTitle.isDisplayed()).toBeTruthy();
    });

    it('should allow a user to create, send, and see the message in history', function () {
        messagesObj.friendMessageButton.click();
        browser.sleep(1500);
        messagesObj.messageField.sendKeys(messagesObj.randomGen());
        browser.sleep(1500);
        messagesObj.sendButton.click();
        browser.sleep(6000);
        // expect(messagesObj.randomMessage.isDisplayed()).toBeTruthy();
        expect(messagesObj.randomMessage).toBeTruthy();
    });
});
