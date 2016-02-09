module.exports = MessageObject;

function MessageObject() {
    
    this.messagesFootTab = $$('.tab-nav a').get(3);
    this.messageUrl = browser.baseUrl + '/#/account/messages';
    
    // buttons
    this.newMessageButton = $('[ng-click="vm.createNewChat()"]')
    this.friendMessageButton = element(by.buttonText('Message'));
    this.closeButton = element(by.buttonText('Close'));
    this.sendButton = element(by.buttonText('Send'));
    this.backButton = $('.ion-ios-arrow-back');
    
    // misc
    this.messageFriendTitle = element(by.cssContainingText('.title', 'Message a friend'));
    this.messageField = element(by.model('vm.message'));
    this.expectedMessage = element(by.cssContainingText('.ng-binding', 'hello james truckerline'));
    
    // creates and sets random message in MessageObject, in order to check for succesfull friend message send/save
    this.randomMessage;
    
    this.randomGen = function () {
        var combos = [
            'joe',
            'truck',
            'joetrucker',
            'trucker',
            'john',
            'jeff',
            'truckerline',
            'outset',
            'james',
            'jim',
            'jimmy',
            'jaime',
            'jamie'
        ];
        
        function rand(){ return Math.floor(Math.random() * combos.length) };
        
        var message = combos[rand()] + combos[rand()] + combos[rand()];
        this.randomMessage = message;
        return message; 
    };
      
    // automate login script
    this.login = function () {
        browser.get('http://localhost:8100/#/login');
        element(by.model('vm.user.email')).sendKeys('himeexcelanta@gmail.com');
        element(by.model('vm.user.password')).sendKeys('jibajaba');
        element(by.buttonText('Login')).click();
    };
}

