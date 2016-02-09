'use strict';

// Protractor configuration
exports.config = {
    // specs: ['./tests/e2e/*/*.spec.js'],
    
    suites: {
        activity: './tests/e2e/activity/*.spec.js',
        friends: './tests/e2e/friends/*.spec.js',
        home: './tests/e2e/home/*.spec.js',
        lockbox: './tests/e2e/lockbox/*.spec.js',
        login: './tests/e2e/login/*.spec.js',
        messages: './tests/e2e/messages/*.spec.js',
        profile: './tests/e2e/profile/*.spec.js',
        signup: './tests/e2e/signup/*.spec.js'
    },

    
    capabilities: {
        'browserName': 'chrome',
        'chromeOptions': {
            prefs: {
                'profile.managed_default_content_settings.geolocation': 1
            }
        }
    },

    seleniumServerJar: 'node_modules/gulp-protractor/node_modules/protractor/selenium/selenium-server-standalone-2.45.0.jar',

    baseUrl: 'http://localhost:8100'

};
