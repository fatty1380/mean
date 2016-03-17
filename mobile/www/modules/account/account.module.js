(function () {
    'use strict';

    var accountModuleDependencies = [
        'pdf',
        'imageviewer',
        'wu.staticGmap',
        'ion-google-place'
    ];

    accountModuleDependencies.push(AppConfig.isDevice ? 'ngCordova' : 'ngCordovaMocks');

    // creating angular module via AppConfig registration method
    // this is just a wrapper-module for the main modules: Profile, Lockbox, Activity, Messages
    AppConfig.registerModule('account', accountModuleDependencies);
})();
