(function () {
    'use strict';

    // creating angular module via AppConfig registration method
    // this is just a wrapper-module for the main modules: Profile, Lockbox, Activity, Messages
    AppConfig.registerModule('account', [
        'pdf',
        'imageviewer',
        'wu.staticGmap',
        'ion-google-place',
        'ngCordovaMocks'
    ]);
})();
