(function () {
    'use strict';

    angular
        .module(AppConfig.appModuleName)
        .service('timerService', timerService);

    timerService.$inject = ['$rootScope', '$interval'];

    function timerService($rootScope, $interval) {
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

        return {
            restartTimer: restartTimer,
            initTimer: initTimer,
            cancelTimer: cancelTimer
        };

        function initTimer(name, intervalSeconds, callback) {
            if (vm[name]) return false;

            var timer = {};
            timer.name = name;
            timer.timeOut = null;
            timer.interval = intervalSeconds || vm.defaultInterval;
            timer.running = false;
            timer.callback = callback;

            vm[name] = timer;

            vm.timers.push(name);

            return startTimer(vm[name]);
        }

        
        function startTimer(timer) {
            if (!timer) return false;

            if (!timer.running) {
                // timer.timeOut = $timeout(onTimeout, timer.interval * 1000, true, timer);
                timer.timeOut = $interval(onTimeout, timer.interval * 1000, true, timer);
                timer.running = true;
            }

            return timer.running;
        }

        function onTimeout(timer) {
            logger.debug('[onTimeout] %s timed out', timer.name);

            if (timer.name === 'security-timer') debugger;

            var timerObj = vm[timer.name];

            timerObj.running = false;

            $rootScope.$broadcast(timer.name + '-stopped');

            if (_.isFunction(timerObj.callback)) {
                timerObj.callback();
            }

            return;
        }

        function restartTimer(name) {
            if (!name) return;

            var timer = vm[name];

            if (!timer) {
                initTimer(name);
                return;
            }

            timer.timeOut = null;
            timer.running = false;

            startTimer(timer);
        }
         

        function cancelTimer(timer) {
            if (_.isString(timer)) { timer = vm[timer]; }
            if (!timer) return;

            $interval.cancel(timer.timeOut);

            timer.running = false;
            timer.interval = null;
            timer.timeOut = null;
        }
    }
})();
