'use strict';

var AppConfig = (function () { // eslint-disable-line no-unused-vars
    var appModuleName = 'truckerline';
    var appModuleDependencies = [
        'ionic',
        'ngMessages',
        'ui.router',
        'ionic.rating',
        'ngIOS9UIWebViewPatch',
        'ngSanitize',
        'monospaced.elastic'
    ];

    var isDevice = /^file/.test(window.location.href);

    if (isDevice) {
        appModuleDependencies.concat([
            'ngCordova.plugins.file',
            'ngCordova.plugins.fileTransfer']);
    }
    else {
        appModuleDependencies.push('ngCordovaMocks');
    }

    // ////////////////////////////////////////////////////////////////////////////////////
    // TODO: Find more appropriate place to put this code (if there is one)
    var envMode = 'prod';

    var debugModes = {
        dev: true,
        local: true,
        prod: false
    };

    var URLs = {
        prod: 'https://app.truckerline.com/',           // PRODUCTION USE
        dev: 'http://outset-dev.elasticbeanstalk.com/', // DEVELOPMENT USE
        local: 'http://localhost:3000/',
        vault: 'http://10.0.1.66:3000/'
    };

    var branchKeys = {
        prod: 'key_live_cjpJIvP9erJIol5fdKzEpmjayAcT0MRH',
        dev: 'key_test_djoMGBQ5jCINia7eaPxrmocbtqjS2VLX',
        local: 'key_test_djoMGBQ5jCINia7eaPxrmocbtqjS2VLX'
    };

    var gaKeys = {
        prod: 'UA-52626400-2',
        dev: 'UA-52626400-3',
        local: 'UA-52626400-3'
    };

    var fbKeys = {
        prod: '1634305163525639',
        dev: '1682496348706520'
    };

    var debug = debugModes[envMode] || false;

    return {
        appModuleName: appModuleName,
        appModuleDependencies: appModuleDependencies,
        registerModule: registerModule,
        debug: debug,
        getUrl: function (env) {
            env = env || envMode;
            return URLs[env] || URLs.dev;
        },
        getBranchKey: function (env) {
            env = env || envMode || debug ? 'dev' : 'prod';

            return branchKeys[env] || branchKeys.dev;
        },
        getGAKey: function (env) {
            env = env || envMode || debug ? 'dev' : 'prod';
            return gaKeys[env] || gaKeys.dev;
        },
        getFBKey: function (env) {
            env = env || envMode || debug ? 'dev' : 'prod';
            return fbKeys[env] || fbKeys.dev;
        },
        isDevice: isDevice
    };
    /** ---------------------------------------------------------- */

    function registerModule (moduleName, dependencies) {
        // create angular module
        angular.module(moduleName, dependencies || []);
        // Add the module to the AngularJS configuration file
        angular.module(appModuleName).requires.push(moduleName);
    }
})();


