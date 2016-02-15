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
        .config(['$provide', function ($provide) {
            // Use the `decorator` solution to substitute or attach behaviors to
            // original service instance; @see angular-mocks for more examples....
            // @attribution http://solutionoptimist.com/2013/10/07/enhance-angularjs-logging-using-decorators/
            // TODO: Implement additional points from article regarding per-class invocation and initailziation.
 
            $provide.decorator('$log', ['$delegate', function ($delegate) {
                // Save the original $log.debug()
                
                _.forOwn($delegate, function (prop, key) {
                    if (_.isFunction(prop)) {
                        $delegate[key] = function () {
                            var args = [].slice.call(arguments);
 
                            // Prepend timestamp
                            args[0] = moment().format('HH:mm:ss') + ' - ' + args[0];
 
                            // Call the original with the output prepended with formatted timestamp
                            prop.apply(null, args);
                        };
                    }
                });

                return $delegate;
            }]);
        }])

        .run(initializePlatform)
        .run(initializeStateChangeListeners)
        .run(initializeBranch);

    initializePlatform.$inject = ['$ionicPlatform', '$window', 'settings', '$log', '$q',
        '$cordovaGoogleAnalytics', '$cordovaKeyboard', '$cordovaStatusbar', '$cordovaDevice'];

    function initializePlatform($ionicPlatform, $window, settings, $log, $q,
        $cordovaGoogleAnalytics, $cordovaKeyboard, $cordovaStatusbar, $cordovaDevice) {

        if (!!$window) {
            $window.logger = $log;
        }

        // setTimeout(function () {

        if (!$window.cordova && _.isUndefined($window.ga)) {
            (function (i, s, o, g, r, a, m) {
                i['GoogleAnalyticsObject'] = r;
                i[r] = i[r] || function () {
                    (i[r].q = i[r].q || []).push(arguments);
                }, i[r].l = 1 * new Date();
                a = s.createElement(o),
                m = s.getElementsByTagName(o)[0];
                a.async = 1;
                a.src = g;
                m.parentNode.insertBefore(a, m);
            })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

            ga('create', settings.gaKey, 'auto');
            ga('send', 'pageview', 'Say Hello from app.init');
        }

        $ionicPlatform.ready(function () {
            logger.info('Cordova Available', !!$window.cordova);
            logger.info('Plugins Available', !!$window.cordova && !!$window.cordova.plugins ? _.keys($window.cordova.plugins) : false);

            if ($window.cordova && $window.cordova.plugins && $window.cordova.plugins.Keyboard) {
                $cordovaKeyboard.hideAccessoryBar(false);
                //cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
            } else if ($window.cordova) {
                logger.error('Cordova Plugins are not Defined - not configuring keyboard');
            }

            if (!!$window.StatusBar) {
                $cordovaStatusbar.style(1);
                // StatusBar.styleDefault();
            }

            ionic.Platform.isFullScreen = true;

            if (!!screen && angular.isFunction(screen.lockOrientation)) {
                screen.lockOrientation('portrait');
            }
        });
        // }, 5000);
    }

    initializeBranch.$inject = ['$ionicPlatform', '$window', 'settings'];
    function initializeBranch($ionicPlatform, $window, settings) {

        $ionicPlatform.ready(function (e) {
            readBranchData();

            $ionicPlatform.on('resume', readBranchData);
        });

        function readBranchData() {
            logger.debug('readBranchData');
            if (!!$window.cordova && !!branch) {

                branch.setDebug(AppConfig.debug);
                branch.init(settings.branchKey, function (err, response) {
                    logger.debug('branch.init - start');

                    if (err) {
                        logger.debug('branch error msg: ' + err);
                    } else {
                        logger.debug('branch data: ' + angular.toJson(response, true));
                    }

                    if (_.isEmpty(response)) {
                        return;
                    }

                    if (!!response.data) {
                        logger.debug('branch data: ' + angular.toJson(response.data, true));
                    }

                    if (!err && response.data) {
                        var parsed_data = angular.fromJson(response.data);
                        logger.debug('Parsed: ' + angular.toJson(parsed_data, true));

                        if (parsed_data['+clicked_branch_link']) {
                            logger.debug('Referral Code' + parsed_data.referring_identity);
                            $window.localStorage.setItem('referralCode', parsed_data.referring_identity);

                            $window.localStorage.setItem('branchData', angular.toJson(parsed_data));
                        }
                    }
                });
            }
        }
    }

    initializeStateChangeListeners.$inject = ['$rootScope', '$window', '$state', '$ionicPlatform', '$cordovaGoogleAnalytics', 'settings'];

    function initializeStateChangeListeners($rootScope, $window, $state, $ionicPlatform, $cordovaGoogleAnalytics, settings) {


        return $ionicPlatform.ready(function (e) {

            var initializeAnalyticsPromise;

            if (!!$window.analytics) {
                logger.info('$cordovaGoogleAnalytics initializing with id [%s]', settings.gaKey);
                initializeAnalyticsPromise = $cordovaGoogleAnalytics
                    .startTrackerWithId(settings.gaKey)
                    .then(function (result) {
                        if (AppConfig.debug) {
                            $cordovaGoogleAnalytics.debugMode();
                        }
                        
                        if (_.isFunction($cordovaGoogleAnalytics.enableUncaughtExceptionReporting)) {
                            $cordovaGoogleAnalytics.enableUncaughtExceptionReporting(true);
                        }

                        $cordovaGoogleAnalytics.trackEvent('Lifecycle', 'launch', location.hash)
                            .catch(function (e) {
                                logger.error('Unable to track Lifecycle Launch Event: ', e, event);
                            });
																												
						$cordovaGoogleAnalytics.trackView($state.current && $state.current.name || location.hash);
                        
                        return true;
                    }, 
                    function startTrackerFailed(e) {
                        logger.error('Unable to Initialize GA Tracker', e);
                        return false;
                        });


            } else if (!$window.analytics && !!$window.ga) {

                logger.warn('$cordovaGoogleAnalytics is not available');

                $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                    $window.ga('send', 'pageview', { page: toState.name });
                    logger.debug('pageview %s', toState.name);
                });

                $rootScope.$on('$ionicView.afterEnter', function (event) {
                    $window.ga('send', 'screenview', { screenName: window.location.hash });
                    logger.debug('trackview %s', window.location.hash);
                });
                return;
            }
            else {
                logger.warn('No Google Analytics Available');
                return;
            }

            return initializeAnalyticsPromise.then(function (response) {
                if(!response) {
                    logger.error('GA Tracker not Initialized', response);
                    return;
                }
                
                $ionicPlatform.on('pause', function (event) {
                    logger.debug('Lifecycle Event: pause', event);
                    $cordovaGoogleAnalytics.trackEvent('Lifecycle', 'pause', location.hash)
                        .catch(function (e) {
                            logger.error('Unable to track Lifecycle Pause Event: ', e, event);
                        });
                });

                $ionicPlatform.on('resume', function (event) {
                    logger.debug('Lifecycle Event: resume', event);
                    $cordovaGoogleAnalytics.trackEvent('Lifecycle', 'resume', location.hash)
                        .catch(function (e) {
                            logger.error('Unable to track Lifecycle Resume Event: ', e, event);
                        });
                });

                var i = 0;

                $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                    logger.debug('StateChange %s -> %s', fromState.name, toState.name);
                    $cordovaGoogleAnalytics.trackView(toState.name)
                        .catch(function (e) {
                            logger.error('Unable to track Lifecycle StateChange Event: ', e, event);
                        });
                    //$window.ga('send', 'pageview', { page: $location.path() });
                });

            });

        });
        // }, 10000);
    }
})();
