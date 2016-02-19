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
    
    // creates and sets `expectedMessage` selector in MessageObject, in order to check for succesfull friend message send/save
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
        this.expectedMessage = element(by.cssContainingText('.ng-binding', message));
        return message; 
    };
      
    // automate login script
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
}
