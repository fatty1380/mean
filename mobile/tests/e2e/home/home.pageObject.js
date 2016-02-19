module.exports = HomeObject;

//FIX ME should split each element exclusive to each page into respective Page Objects

function HomeObject() {
    
    // urls
    this.homeUrl = browser.baseUrl + '/#/home';
    
    // buttons
    this.loginButton = element(by.buttonText('Login'));
    this.signupButton = element(by.buttonText('Sign Up'));
    
    // misc elements
    this.emailField = element(by.model('vm.user.email'));
    this.firstName = element(by.model('vm.user.firstName'));
    this.inputFields = element.all(by.css('.item-input'));
}
