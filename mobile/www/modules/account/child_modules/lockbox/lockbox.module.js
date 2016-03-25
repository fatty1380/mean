(function() {
    'use strict';

    var lockboxModuleDependencies = ['account', 'pdf'];

    debugger;
    if (AppConfig.isDevice) {
        // alert('IMA Device - Lockup!');
        lockboxModuleDependencies.concat([
            'ngCordova.plugins.file',
            'ngCordova.plugins.fileTransfer']);
    }
    else {
        lockboxModuleDependencies.push('ngCordovaMocks');
    }
    // creating angular module via AppConfig registration method
    AppConfig.registerModule('lockbox', lockboxModuleDependencies);


})();
