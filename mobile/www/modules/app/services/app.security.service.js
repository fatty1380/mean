(function () {
    'use strict';

    angular
        .module(AppConfig.appModuleName)
        .service('securityService', securityService);

    securityService.$inject = ['$rootScope', 'timerService'];

    function securityService($rootScope, timerService) {

        var PIN = '0000',
        state = {
            accessible: false
        };

        $rootScope.$on("security-timer-stopped", function (event) {
            lock();
        });

        function lock () {
            console.info(' --->>> lockbox locked <<<--- ');
            state.accessible = false;
        }

        function unlock (pin) {
            if(PIN === pin){
                console.info(' --->>> lockbox unlocked <<<--- ');

                state.accessible = true;

                // lock lockbox documents every 15 minutes
                timerService.initTimer('security-timer', 15*60);
            }

            return state.accessible;
        }

        function getState () {
            return state;
        }

        return {
            unlock: unlock,
            lock: lock,
            getState: getState
        }
    }

})();
