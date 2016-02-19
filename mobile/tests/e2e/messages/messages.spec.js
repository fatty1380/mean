var capture = require('../screenshot'),
    MessagesObject = require('./messages.pageObject'),
    messagesObj = new MessagesObject;

describe('messages page', function () {

    beforeEach(function () { });

    afterEach(function () {
        var spec = jasmine.getEnv().currentSpec;
    });
    
    it('should allow a user to login and navigate to `MESSAGES`', function () {
        messagesObj.login();
        messagesObj.messagesFootTab.click();
        //assertions
        expect(browser.getCurrentUrl()).toBe(messagesObj.messageUrl);
        expect(messagesObj.newMessageButton.isDisplayed()).toBeTruthy();
    });

    it('should render the `Message A Friend` view upon clicking the `New Message` button', function () {
        messagesObj.newMessageButton.click();
        //assertions
        expect(messagesObj.messageFriendTitle.isDisplayed()).toBeTruthy();
    });

    it('should allow a user to create, send, and see the message in history', function () {
        messagesObj.friendMessageButton.click();
        messagesObj.messageField.sendKeys(messagesObj.randomGen());
        messagesObj.sendButton.click();
        //asertions
        expect(messagesObj.expectedMessage.isDisplayed()).toBeTruthy();
    });
});
