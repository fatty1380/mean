(function () {
    'use strict';

    angular
        .module(AppConfig.appModuleName)
        .service('utilsService', utilsService);

    utilsService.$inject = ['$interval'];

    function utilsService($interval) {
        var clock = null;

        /**
         * @desc returns serialized data
        * */
        function serialize(obj, prefix) {
            var str = [];
            for (var p in obj) {
                if (obj.hasOwnProperty(p)) {
                    var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
                    str.push(typeof v == "object" ?
                        serialize(v, k) :
                    encodeURIComponent(k) + "=" + encodeURIComponent(v));
                }
            }
            return str.join("&");
        }

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
            serialize : serialize,
            startClock : startClock,
            stopClock : stopClock
        };
    };
})();
