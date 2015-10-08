(function () {
    'use strict';

    angular
        .module(AppConfig.appModuleName)
        .service('securityService', securityService);

    securityService.$inject = ['$rootScope', 'timerService', 'userService', '$window'];

    function securityService($rootScope, timerService, userService, $window) {

        var PIN, state = {};

        initialize();

        function initialize () {
            userService.getUserData()
                .then(function (data) {
                    PIN = data.props.pin || null;
                    PIN ? state.secured = true : state.secured = false;
                });

            state.accessible = false;

            $rootScope.$on("security-timer-stopped", function (event) {
                lock();
            });
        }

        function lock () {
            state.accessible = false;
        }

        function unlock (pin) {
            if(PIN === pin){
                state.accessible = true;
                // lock lockbox documents every 15 minutes
                timerService.initTimer('security-timer', 15*60);
            }
            return state.accessible;
        }

        function setPin (pin) {
            PIN = pin;
            userService.updateUserProps({pin: pin});
            $window.localStorage.setItem('lockbox_pin', pin)
        }

        function getPin () {
            if(PIN) return PIN;

            return userService.getUserData()
                .then(function (data) {
                    return data.props.pin || null;
                });
        }

        function getState () {
            return state;
        }

        return {
            unlock: unlock,
            lock: lock,
            setPin: setPin,
            getPin: getPin,
            getState: getState
        }
    }

})();
