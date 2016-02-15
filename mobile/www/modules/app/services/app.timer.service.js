(function () {
    'use strict';

    angular
        .module(AppConfig.appModuleName)
        .service('timerService', timerService);

    timerService.$inject = ['$interval', '$rootScope', '$timeout'];

    function timerService ($interval, $rootScope, $timeout) {
        var vm = this;

        vm.timers = [];

        // default interval in seconds
        vm.defaultInterval = 30;

        $rootScope.$on('clear', function () {
            for (var i = 0; i < vm.timers.length; i++) {
                var timer = vm[vm.timers[i]];
                cancelTimer(timer);
            }
        });

        return {
            initTimer: initTimer,
            initInterval: initInterval,
            cancelTimer: cancelTimer
        };

        function initTimer (name, intervalSeconds, callback) {
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

        function initInterval (name, intervalSeconds, callback) {
            if (vm[name]) return false;

            var timer = {};
            timer.name = name;
            timer.timeOut = null;
            timer.interval = intervalSeconds || vm.defaultInterval;
            timer.running = false;
            timer.callback = callback;

            vm[name] = timer;

            vm.timers.push(name);

            return startInterval(vm[name]);
        }

        function startTimer (timer) {
            if (!timer) return false;

            if (!timer.running) {
                timer.timeOut = $interval(onTimeout, timer.interval * 1000, 1, true, timer);
                timer.running = true;
            }

            return timer.running;
        }

        function startInterval (timer) {
            if (!timer) return false;

            if (!timer.running) {
                timer.timeOut = $interval(requestUpdate, timer.interval * 1000, 0, false, timer);
                timer.running = true;
            }

            return timer.running;
        }

        function requestUpdate (timer) {
            $rootScope.$broadcast(timer.name + '-refresh');
        }

        function onTimeout (timer) {
            logger.debug('[onTimeout] %s timed out', timer.name);

            var timerObj = vm[timer.name];

            timerObj.running = false;

            if (_.isFunction(timerObj.callback)) {
                timerObj.callback();
            }

            return;
        }

        function cancelTimer (timer) {
            if (_.isString(timer)) { timer = vm[timer]; }
            if (!timer) return;

            $timeout.cancel(timer.timeOut);

            timer.running = false;
            timer.interval = null;
            timer.timeOut = null;
        }

        function cancelInterval (timer) {

            if (_.isString(timer)) { timer = vm[timer]; }
            if (!timer) return;

            $interval.cancel(timer.timeOut);

            timer.running = false;
            timer.interval = null;
            timer.timeOut = null;
        }
    }
})();
