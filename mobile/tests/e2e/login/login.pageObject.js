module.exports = LoginObject;

function LoginObject () {
    this.loginButton = element(by.buttonText('Login'));
    this.emailField = element(by.model('vm.user.email'));
    this.passwordField = element(by.model('vm.user.password'));
    this.inputFields = element.all(by.css('.item-input'));
    this.error = element(by.css('.error'));
}
