(function () {
    'use strict';

    angular
        .module(AppConfig.appModuleName)
        .service('utilsService', utilsService);

    utilsService.$inject = ['$interval'];

    function utilsService($interval) {
        var clock = null;

        /**
         * @desc start interval
         * */
        function startClock(fn, time){
            if(clock === null){
                clock = $interval(fn, time);
            }
        }

        /**
         * @desc stop interval
         * */
        function stopClock(){
            if(clock !== null){
                $interval.cancel(clock);
                clock = null;
            }
        }

        return {
            startClock : startClock,
            stopClock : stopClock
        };
    };
})();
