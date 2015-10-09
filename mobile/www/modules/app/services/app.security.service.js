(function () {
    'use strict';

    angular
        .module(AppConfig.appModuleName)
        .service('securityService', securityService);

    securityService.$inject = ['$rootScope', 'timerService', 'userService', '$window', '$q'];

    function securityService($rootScope, timerService, userService, $window, $q) {

        var PIN;
        var state = {
            secured: false,
            accessible: false
        };

        initialize();
        
        return {
            unlock: unlock,
            lock: lock,
            setPin: setPin,
            getPin: getPin,
            getState: getState
        }
        
        /////////////////////////////////////////////////////////////////////////////

        function initialize () {
            userService.getUserData()
                .then(function (data) {
                    PIN = data.props.pin || null;
                    state.secured = (PIN ? true : false);
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
            if (PIN) return $q.when(PIN);

            return userService.getUserData()
                .then(function (data) {
                    return data.props.pin || null;
                });
        }

        function getState () {
            return state;
        }
    }

})();
