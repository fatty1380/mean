(function () {
    'use strict';

    // creating main application module
    angular
        .module(AppConfig.appModuleName, AppConfig.appModuleDependencies)
        .config([
            '$urlRouterProvider', function ($urlRouterProvider) {
                //logger.warn('unknown route or url: ' + location.hash);
                $urlRouterProvider.otherwise('home');
            }
        ])
        .config(['$ionicConfigProvider', function ($ionicConfigProvider) {
            $ionicConfigProvider.tabs.position('bottom');
        }])

        .config(['$compileProvider', function ($compileProvider) {
            // disable debug info
            $compileProvider.debugInfoEnabled(AppConfig.debug);
        }])
        .config(['msdElasticConfig', function (config) {
            config.append = '\n';
        }])
        .config(["$provide", function ($provide) {
            // Use the `decorator` solution to substitute or attach behaviors to
            // original service instance; @see angular-mocks for more examples....
            // @attribution http://solutionoptimist.com/2013/10/07/enhance-angularjs-logging-using-decorators/
            // TODO: Implement additional points from article regarding per-class invocation and initailziation.
 
            $provide.decorator('$log', ["$delegate", function ($delegate) {
                // Save the original $log.debug()
                
                _.forOwn($delegate, function (prop, key) {
                    if (_.isFunction(prop)) {
                        $delegate[key] = function () {
                            var args = [].slice.call(arguments),
                                now = moment().format('HH:MM:SS');
 
                            // Prepend timestamp
                            args[0] = now + ' - ' + args[0];
 
                            // Call the original with the output prepended with formatted timestamp
                            prop.apply(null, args)
                        };
                    }
                }); 
                
                return $delegate;
            }]);
        }])

        .run(initializePlatform);

    initializePlatform.$inject = ['$ionicPlatform', '$window', 'settings', '$log', '$cordovaGoogleAnalytics']

    function initializePlatform($ionicPlatform, $window, settings, $log, $cordovaGoogleAnalytics) {

        if (!!$window) {
            $window.logger = $log;
        }

        $ionicPlatform.ready(function () {
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }

            ionic.Platform.isFullScreen = true;

            if (!!screen && angular.isFunction(screen.lockOrientation)) {
                screen.lockOrientation('portrait');
            }

            readBranchData();

            $ionicPlatform.on('resume', readBranchData);
        });

        function readBranchData() {
            logger.debug('readBranchData');
            if (!!window.cordova) {

                branch.setDebug(AppConfig.debug);
                branch.init(settings.branch.key, function (err, response) {
                    logger.debug("branch.init - start");

                    if (err) {
                        logger.debug("branch error msg: " + err);
                    } else {
                        logger.debug("branch data: " + JSON.stringify(response, null, 1));
                    }

                    if (_.isEmpty(response)) {
                        return;
                    }

                    if (!!response.data) {
                        logger.debug("branch data: " + JSON.stringify(response.data, null, 1));
                    }

                    if (!err && response.data) {
                        var parsed_data = JSON.parse(response.data);
                        logger.debug('Parsed: ' + JSON.stringify(parsed_data, null, 1))

                        if (parsed_data['+clicked_branch_link']) {
                            logger.debug('Referral Code' + parsed_data.referring_identity);
                            $window.localStorage.setItem('referralCode', parsed_data.referring_identity);

                            $window.localStorage.setItem('branchData', JSON.stringify(parsed_data));
                        }
                    }
                });
            }
        }
    }
})();
