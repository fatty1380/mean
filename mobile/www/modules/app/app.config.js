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
        // alert('IMA Device - appconfig!');
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

    

    var screenConfigs = {
        'account.profile': {
            title: 'Your TruckerLine Profile',
            text: 'With your profile you will build and mange your Professional reputation. Be sure to fill out your experience and request reviews from shippers and co-workers. When you’re ready to apply for a job, or pick up a load make sure to share your profile with the interested party to put your best foot forward!'
        },
        'account.profile.reviews': {
            text: 'This is your Reviews Section where you can request reviews from people you have worked with previously. Use reviews as your place to show your professionalism and work ethic in ways that traditional driver reports can’t!'
        },
        'account.lockbox': {
            title: 'Secure Document Lockbox',
            text: 'Welcome to your Secure TruckerLine Document Lockbox. Here you can manage, view and share all of your Professional Documentation by simply scanning it with your smartphone and own your reputation by including your MVR, Background check and Employment Verification right in your profile. This area is secured, and information will never be shared without your consent. '
        },
        'account.activity': {
            title: 'Your Activity Feed',
            text: 'This is your activity feed where you can keep a personal log of your daily drive and see what your industry friends are up to when they post their daily log. Get started and Add your First Activity!'
        },
        'account.messages': {
            title: 'Welcome to your Messages',
            text: 'Use this area to communicate with people you’ve connected with in the Industry and want to stay in touch with!'
        },
        'lockbox.add': {
            title: 'Adding Lockbox Documents',
            text: 'Adding documents to your lockbox is easy. Simply place the document you want to add on a flat, well-list area and take a clear picture, trying to fill up the whole screen. Once you have a good picture, you can select the document type, save it, and it will be waiting securely in your lockbox anytime you need it.'
        },
        'documents.share': {
            title: 'Sending Resume and Docs',
            text: 'Select the Documents you\'d like to email with your Resume, and Securely email them from wherever! Let\'s get started by entering your Lockbox Password...'
        },
        'account.home': {
            title: 'Grow your Convoy!',
            subHeader: 'Daily Updates - ',
            text: 'See what your Friends are Hauling & where they are in the US!',
            subHeaderSec: 'Free MVR Offer - ',
            textSec: 'Invite 5+ Truckers and receive a free MVR for your Lockbox!',
            views: 2,
            delayDays: 1
        },
        'badge.info': {
            title: '',
            text: ''
        },
        'promo.success': {
            title: 'Thank You!',
            text: 'Your help in inviting friends is greatly appreciated. As a token of our thanks, we have provided you with a promo code',
            promoCode: ''
        }
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
        isDevice: isDevice,
        screenConfigs: screenConfigs
    };
    /** ---------------------------------------------------------- */

    function registerModule (moduleName, dependencies) {
        // create angular module
        angular.module(moduleName, dependencies || []);
        // Add the module to the AngularJS configuration file
        angular.module(appModuleName).requires.push(moduleName);
    }
})();


