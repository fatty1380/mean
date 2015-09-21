(function () {
    'use strict';

    angular
        .module(AppConfig.appModuleName)
        .service('updateService', updateService);

    updateService.$inject = ['$http', 'settings', 'timerService', '$rootScope'];

    function updateService($http, settings, timerService, $rootScope) {
        var latestActivityTimeStamp = '',
            latestMessageTimeStamp = '';

        $rootScope.$on('timer-stopped', function(event, remaining) {
            if(remaining === 0) {

                console.info(' --->>> Get Update and restart timer on success <<<--- ');


                timerService
                    .restartTimer();
            }
        });

        return  {
            getLastUpdates: getLastUpdates,
            getLatestMessage: getLatestMessage,
            getLatestActivity: getLatestActivity
        };

        function getLastUpdates() {
            timerService
                .start();
        }


        function getLatestActivity () {
            return latestActivityTimeStamp;
        }

        function getLatestMessage () {
            return latestMessageTimeStamp;
        }
    }
})();
