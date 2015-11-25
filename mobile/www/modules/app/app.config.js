'use strict';

var AppConfig = (function () {
    var appModuleName = 'truckerline',
        appModuleDependencies = [
            'ionic',
            'ui.router',
            'ionic.rating',
            'ngCordova.plugins.file',
            'ngCordova.plugins.fileTransfer',
            'ngIOS9UIWebViewPatch',
            'monospaced.elastic'
        ],
        registerModule = function (moduleName, dependencies) {
            // create angular module
            angular.module(moduleName, dependencies || []);
            // Add the module to the AngularJS configuration file
            angular.module(appModuleName).requires.push(moduleName);
        };
        
    //////////////////////////////////////////////////////////////////////////////////////
    // TODO: Find more appropriate place to put this code (if there is one)
        
    var debug = true;

    var URLs = {
        prod: 'https://app.truckerline.com/',              // PRODUCTION USE
        dev: 'http://outset-dev.elasticbeanstalk.com/', // DEVELOPMENT USE
        local: 'http://localhost:3000/',
        vault: 'http://10.0.1.66:3000/'
    };

    var branchKeys = {
        prod: 'key_live_cjpJIvP9erJIol5fdKzEpmjayAcT0MRH',
        dev: 'key_test_djoMGBQ5jCINia7eaPxrmocbtqjS2VLX'
    };
    
    var gaKeys = {
        prod: 'UA-52626400-2',
        dev: 'UA-52626400-3'
    };

    return {
        appModuleName: appModuleName,
        appModuleDependencies: appModuleDependencies,
        registerModule: registerModule,
        debug: debug,
        getUrl: function (env) {
            env = env || debug ? 'dev' : 'prod';
            
            return URLs[env] || URLs['dev'];
        },
        getBranchKey: function (env) {
            env = env || debug ? 'dev' : 'prod';
            
            return branchKeys[env];
        },
        getGAKey: function (env) {
            env = env || debug ? 'dev' : 'prod';
            return gaKeys[env];
        }
    };
})();

