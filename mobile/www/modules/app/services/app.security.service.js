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

        return {
            initialize: initialize,
            unlock: unlock,
            lock: lock,
            setPin: setPin,
            getPin: getPin,
            getState: getState,
            logout: logout
        }
        
        /////////////////////////////////////////////////////////////////////////////

        function initialize() {
            state = {
                secured: false,
                accessible: false
            };
            PIN = null;
            
            userService.getUserData()
                .then(function (data) {
                    if (_.isEmpty(data)) {
                        return;
                    }
                    
                    PIN = data.props.pin || null;
                    state.secured = (!!PIN ? true : false);
                });

            $rootScope.$on("security-timer-stopped", function (event) {
                lock();
            });
        }

        function lock() {
            state.accessible = false;
        }

        function unlock(pin) {
            if (PIN === pin) {
                state.accessible = true;
                // lock lockbox documents every 15 minutes
                timerService.initTimer('security-timer', 15 * 60);
            }
            return state.accessible;
        }

        function setPin(pin) {
            PIN = pin;
            userService.updateUserProps({ pin: pin });
            $window.localStorage.setItem('lockbox_pin', pin)
        }

        function getPin() {
            if (PIN) return $q.when(PIN);

            return userService.getUserData()
                .then(function (data) {
                    return data.props.pin || null;
                });
        }

        function getState() {
            return state;
        }

        function logout() {
            timerService.cancelTimer('security-timer');
            state.accessible = false;
            $window.localStorage.removeItem('lockbox_pin');
            PIN = null;
        }
    }

})();
