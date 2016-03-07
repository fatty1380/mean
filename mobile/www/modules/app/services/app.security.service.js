(function () {
    'use strict';

    angular
        .module(AppConfig.appModuleName)
        .service('securityService', securityService);

    securityService.$inject = ['$rootScope', 'timerService', 'userService', 'StorageService', '$q'];

    function securityService ($rootScope, timerService, userService, StorageService, $q) {

        var PIN;
        var state = {
            initialized: false,
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
        };

        // ///////////////////////////////////////////////////////////////////////////

        function initialize () {
            state = {
                secured: false,
                accessible: false
            };
            PIN = null;

            $rootScope.$on('security-timer-stopped', function () {
                lock();
            });

            state.initialized = true;
        }

        function lock () {
            $rootScope.$broadcast('lockbox-secured');
            logger.debug('Locking Lockbox');
            state.accessible = false;
        }

        function unlock (pin) {
            logger.debug('UnLocking Lockbox');
            if (PIN === pin) {
                state.accessible = true;
                // lock lockbox documents every 15 minutes
                timerService.initTimer('security-timer', 15 * 60, false);
                $rootScope.$broadcast('lockbox-unlocked');
            }
            return state.accessible;
        }

        function setPin (pin) {
            PIN = pin;
            userService.updateUserProps({ pin: pin });
            StorageService.set('lockbox_pin', pin);
        }

        function getPin () {
            if (!state.initialized) {
                initialize();
            }

            if (PIN) { return $q.when(PIN); }

            return userService.getUserData()
                .then(function (data) {
                    if (_.isEmpty(data)) {
                        return null;
                    }

                    PIN = data.props.pin || null;
                    state.secured = (!!PIN ? true : false);

                    return PIN;
                });
        }

        function getState () {
            return state;
        }

        function logout () {
            timerService.cancelTimer('security-timer');
            state.accessible = false;
            state.initialized = false;
            StorageService.remove('lockbox_pin');
            PIN = null;
        }
    }

})();
