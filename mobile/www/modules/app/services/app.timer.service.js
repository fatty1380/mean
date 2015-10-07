(function () {
    'use strict';

    angular
        .module(AppConfig.appModuleName)
        .service('timerService', timerService);

    timerService.$inject = ['$rootScope', '$timeout'];

    function timerService($rootScope, $timeout) {
        var vm = this;

        vm.timers = [];

        // default interval in seconds
        vm.defaultInterval = 30;

        $rootScope.$on("clear", function () {
            for (var i = 0; i < vm.timers.length; i++) {
                var timer = vm[vm.timers[i]];
                cancelTimer(timer);
            }
        });

        function initTimer (name, interval, immediate) {
            vm[name] = {};
            vm[name].name = name;
            vm[name].timeOut = null;
            vm[name].interval = interval || vm.defaultInterval;
            vm[name].counter = null;
            vm[name].running = false;

            vm.timers.push(name);

            startTimer(vm[name], immediate);
        }

        function startTimer (timer, immediate) {
            if(!timer) return;

            console.info(' --->>> starting ' + timer.name + ' <<<--- ');

            // run immediately for the first time
            if(immediate && timer.counter === null){
                timer.counter = 0;
            } else {
                timer.counter = timer.interval;
            }

            if(!timer.running) {
                timer.timeOut = $timeout(onTimeout, 1000, true, timer);
                timer.running = true;
            }
        }

        function onTimeout (timer) {
            if(timer.counter ===  0) {
                var timerObj = vm[timer.name];

                timerObj.running = false;
                timerObj.counter = 0;

                $rootScope.$broadcast(timer.name + '-stopped');
                return;
            }

            console.warn(timer.name + ' counter --->>>', timer.counter);

            timer.counter--;
            timer.timeOut = $timeout(onTimeout, 1000, true, timer);
        }

        function restartTimer (name) {
            if(!name) return;

            var timer = vm[name];

            if(!timer) {
                initTimer(name);
                return;
            }

            timer.counter = timer.interval;
            timer.timeOut = null;
            timer.running = false;

            startTimer(timer);
        }

        function cancelTimer (timer) {
            if(timer) return;

            $timeout.cancel(timer.timeOut);

            timer.running = false;
            timer.interval = null;
            timer.counter = null;
            timer.myTimeOut = null;
        }

        return {
            restartTimer: restartTimer,
            initTimer: initTimer
        };
    }
})();
