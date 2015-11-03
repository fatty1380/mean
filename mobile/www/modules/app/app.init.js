(function () {
    'use strict';

    // creating main application module
    angular
        .module(AppConfig.appModuleName, AppConfig.appModuleDependencies)
        .config([
            '$urlRouterProvider', function ($urlRouterProvider) {
                //console.warn('unknown route or url: ' + location.hash);
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

        .run(initializePlatform);

    initializePlatform.$inject = ['$ionicPlatform', '$window', 'settings']

    function initializePlatform($ionicPlatform, $window, settings) {
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
            console.log('readBranchData');
            if (!!window.cordova) {

                branch.setDebug(false);
                debugger;
                branch.init(settings.branch.liveKey, function (err, response) {
                    alert("branch.init - start");

                    if (err) {
                        alert("branch error msg: " + err);
                    } else {
                        alert("branch data: " + JSON.stringify(response, null, 1));
                        console.log("branch data: " + JSON.stringify(response, null, 1))
                    }
                    
                    if (!!response.data) {
                        alert("branch data: " + JSON.stringify(response.data, null, 1));
                        console.log("branch data: " + JSON.stringify(response.data, null, 1))
                    }


                    debugger;
                    if (!err && response.data) {
                        var parsed_data = JSON.parse(response.data);
                        alert('Parsed: ' + JSON.stringify(parsed_data, null, 1))

                        if (parsed_data['+clicked_branch_link']) {
                            alert('Referral Code' + parsed_data.referring_identity);
                            $window.localStorage.setItem('referralCode', parsed_data.referring_identity);
                            $window.localStorage.setItem('branchData', JSON.stringify(parsed_data));
                        }
                    }
                });
            }
        }
    }
})();
