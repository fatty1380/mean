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

        .run(initializePlatform)
        .run(initializeBranch)
        .run(initializeStateChangeListeners);

    initializePlatform.$inject = ['$ionicPlatform', '$window', 'settings', '$log', '$q',
        '$cordovaGoogleAnalytics', '$cordovaKeyboard', '$cordovaStatusbar', '$cordovaDevice']

    function initializePlatform($ionicPlatform, $window, settings, $log, $q,
        $cordovaGoogleAnalytics, $cordovaKeyboard, $cordovaStatusbar, $cordovaDevice) {

            if (!!$window) {
                $window.logger = $log;
            }

        // setTimeout(function () {

            if (!$window.cordova && _.isUndefined($window.ga)) {
                debugger;
                (function (i, s, o, g, r, a, m) {
                    i['GoogleAnalyticsObject'] = r;
                    i[r] = i[r] || function () {
                        (i[r].q = i[r].q || []).push(arguments)
                    }, i[r].l = 1 * new Date();
                    a = s.createElement(o),
                    m = s.getElementsByTagName(o)[0];
                    a.async = 1;
                    a.src = g;
                    m.parentNode.insertBefore(a, m)
                })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

                ga('create', settings.ga.web, 'auto');
                ga('send', 'pageview', 'Say Hello from app.init');
            }

            $ionicPlatform.ready(function () {
                debugger;
                logger.info('Cordova Available', !!$window.cordova);
                logger.info('Plugins Available', !!$window.cordova.plugins ? _.keys($window.cordova.plugins) : false);

                if ($window.cordova && $window.cordova.plugins && $window.cordova.plugins.Keyboard) {
                    $cordovaKeyboard.hideAccessoryBar(false);
                    //cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
                } else if ($window.cordova) {
                    logger.error('Cordova Plugins are not Defined - not configuring keyboard')
                }

                if (!!$window.StatusBar) {
                    $cordovaStatusbar.style(1);
                    // StatusBar.styleDefault();
                }

                ionic.Platform.isFullScreen = true;

                if (!!screen && angular.isFunction(screen.lockOrientation)) {
                    screen.lockOrientation('portrait');
                }

                if (!!$window.analytics) {
                    debugger;
                    logger.info('$cordovaGoogleAnalytics initializing with id [%s]', settings.ga.dev);
                    $cordovaGoogleAnalytics.startTrackerWithId(settings.ga.dev)
                        .catch(function (e) {
                            logger.error('Unable to Initialize GA Tracker', e);
                        });

                    $cordovaGoogleAnalytics.debugMode();

                    var er = $cordovaGoogleAnalytics.enableUncaughtExceptionReporting ? $cordovaGoogleAnalytics.enableUncaughtExceptionReporting : analytics.enableUncaughtExceptionReporting

                    er(true);
                } else {
                    logger.warn('$cordovaGoogleAnalytics is not available');
                }
            });
        // }, 5000);
    }

    initializeBranch.$inject = ['$ionicPlatform', '$window', 'settings']
    function initializeBranch($ionicPlatform, $window, settings) {

        $ionicPlatform.ready(function (e) {
                readBranchData();

                $ionicPlatform.on('resume', readBranchData);
            });

            function readBranchData() {
                logger.debug('readBranchData');
            if (!!$window.cordova && !!branch) {

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

    initializeStateChangeListeners.$inject = ['$rootScope', '$window', '$ionicPlatform', '$cordovaGoogleAnalytics'];

    function initializeStateChangeListeners($rootScope, $window, $ionicPlatform, $cordovaGoogleAnalytics) {
        

        // setTimeout(function () {

            if (!$window.analytics && !!$window.ga) {
                debugger;

                $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                    $window.ga('send', 'pageview', { page: toState.name });
                    logger.debug('pageview %s', toState.name);
                });

                $rootScope.$on('$ionicView.afterEnter', function (event) {
                    $window.ga('send', 'screenview', { screenName: window.location.hash });
                    logger.debug('trackview %s', window.location.hash);
                })
                return;
            }
            else if (!$window.analytics) {
                logger.warn('No Google Analytics Available');
                return;
            }

            var i = 0;

            debugger;

            $ionicPlatform.ready(function (event) {

                logger.debug('Lifecycle Event: launch', event);
                $cordovaGoogleAnalytics.trackEvent('Lifecycle', 'launch', location.hash)
                    .catch(function (e) {
                        logger.error('Unable to track Lifecycle Event', e, event);
                    });
            })

            $ionicPlatform.on('pause', function (event) {
                logger.debug('Lifecycle Event: pause', event);
                $cordovaGoogleAnalytics.trackEvent('Lifecycle', 'pause', location.hash)
                    .catch(function (e) {
                        logger.error('Unable to track Lifecycle Event', e, event);
                    });
            });

            $ionicPlatform.on('resume', function (event) {
                logger.debug('Lifecycle Event: resume', event);
                $cordovaGoogleAnalytics.trackEvent('Lifecycle', 'resume', location.hash)
                    .catch(function (e) {
                        logger.error('Unable to track Lifecycle Event', e, event);
                    });
            });


            $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                logger.debug('StateChange %s -> %s', fromState.name, toState.name);
                $cordovaGoogleAnalytics.trackEvent('StateChange', fromState.name, toState.name, i++)
                    .catch(function (e) {
                        logger.error('Unable to track Lifecycle Event', e, event);
                    });
                //$window.ga('send', 'pageview', { page: $location.path() });
            });

            $rootScope.$on('$ionicView.afterEnter', function (event) {
                logger.debug('StateChange --> %s', window.location.hash);
                $cordovaGoogleAnalytics.trackView(window.location.hash)
                    .catch(function (e) {
                        logger.error('Unable to track Lifecycle Event', e, event);
                    });
            })
        // }, 10000);
    }
})();
