// Karma configuration
// Generated on Thu Jul 09 2015 17:29:34 GMT+0300 (EEST)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      "www/lib/ionic/release/js/ionic.bundle.js",
      'node_modules/angular-mocks/angular-mocks.js',
      'node_modules/jasmine-expect/dist/jasmine-matchers.js',

      'www/modules/app/*.js',
      'www/modules/app/constants/*.js',
      'www/modules/app/services/*.js',
      
      'www/modules/avatar/avatar.module.js',
      'www/modules/avatar/services/*.js',
      'www/modules/avatar/controllers/*.js',

      'www/lib/angular-google-staticmaps/angular-google-staticmaps.js',
      'www/lib/ngCordova/dist/ng-cordova.js',
      'https://maps.googleapis.com/maps/api/js?key=AIzaSyBU1fUj13JDJpKxczSfAHzGSuk8ARoenrk&sensor=true&libraries=geometry,places',

      'www/modules/account/account.module.js',

      'www/modules/account/child_modules/profile/profile.module.js',
      'www/modules/account/child_modules/profile/controllers/*.js',
      'www/modules/account/child_modules/profile/services/*.js',

      'www/modules/account/child_modules/activity/activity.module.js',
      'www/modules/account/child_modules/activity/directives/*.js',
      'www/modules/account/child_modules/activity/controllers/*.js',
      'www/modules/account/child_modules/activity/services/*.js',

      'www/modules/signup/signup.modules.js',
      'www/modules/signup/controllers/*.js',
      'www/modules/signup/directives/*.js',
      'www/modules/signup/services/*.js',
      
      'www/modules/account/child_modules/lockbox/lockbox.module.js',
      'www/modules/account/child_modules/lockbox/controllers/*.js',
      'www/modules/account/child_modules/lockbox/services/*.js',
      'www/modules/account/child_modules/lockbox/directives/*.js',

      'www/modules/account/child_modules/messages/messages.module.js',
      'www/modules/account/child_modules/messages/controllers/*.js',
      'www/modules/account/child_modules/messages/services/*.js',

      'tests/**/*.js',
      'tests/!**!/!**!/!*.js'
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  })
};
