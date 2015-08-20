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
      "www/lib/ionic/js/ionic.bundle.js",
      'node_modules/angular-mocks/angular-mocks.js',
      'www/modules/app/*.js',
      'www/modules/app/constants/settings.js',

      'www/modules/account/account.module.js',
      'www/modules/account/child_modules/profile/controllers/profile.controller.js',
      'www/modules/account/child_modules/profile/profile.module.js',
      'www/modules/account/child_modules/profile/services/profile.services.js',
      'www/modules/account/child_modules/profile/services/profile.reviews.service.js',

      'www/modules/account/child_modules/lockbox/lockbox.module.js',
      'www/modules/account/child_modules/lockbox/controllers/*.js',
      'www/modules/account/child_modules/lockbox/services/*.js',
      'www/modules/account/child_modules/lockbox/directives/*.js',

      'www/modules/signup/signup.modules.js',
      'www/modules/signup/controllers/*.js',
      'www/modules/signup/services/*.js',

      'tests/**/*.js',
      'tests/**/**/*.js'
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
