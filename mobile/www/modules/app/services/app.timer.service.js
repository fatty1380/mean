(function () {
    'use strict';

    angular
        .module(AppConfig.appModuleName)
        .service('timerService', timerService);

    timerService.$inject = ['$interval', '$rootScope', '$timeout'];

    function timerService ($interval, $rootScope, $timeout) {
        var vm = this;

        vm.timers = [];
        vm.intervals = [];

        // default interval in seconds
        vm.defaultInterval = 30;

        $rootScope.$on('clear', function () {

            _.each(vm.timers, function (t) {
                if (cancelTimer(t)) {
                    logger.debug('Stopped Timer `%s`', t.name);
                    _.remove(vm.timers, t);
                }
            });

            _.each(vm.intervals, function (i) {
                if (cancelInterval(i)) {
                    logger.debug('Stopped Interval `%s`', i.name);
                    _.remove(vm.intervals, i);
                }
            });

            if (vm.timers.length > 0) {
                logger.error('Active Timers remain after clear event: ', vm.timers);
                vm.timers = [];
            }

            if (vm.intervals.length > 0) {
                logger.error('Active intervals remain after clear event: ', vm.intervals);
                vm.intervals = [];
            }
        });

        return {
            initTimer: initTimer,
            initInterval: initInterval,
            cancelTimer: cancelTimer
        };

        function initTimer (name, intervalSeconds, callback) {
            if (vm[name]) { return false; }

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
            if (vm[name]) { return false; }

            var interval = {};
            interval.name = name;
            interval.timeOut = null;
            interval.interval = intervalSeconds || vm.defaultInterval;
            interval.running = false;
            interval.callback = callback;

            vm[name] = interval;

            vm.intervals.push(name);

            return startInterval(vm[name]);
        }

        function startTimer (timer) {
            if (!timer) { return false; }

            if (!timer.running) {
                timer.timeOut = $interval(onTimeout, timer.interval * 1000, 1, true, timer);
                timer.running = true;
            }

            return timer.running;
        }

        function startInterval (interval) {
            if (!interval) { return false; }

            if (!interval.running) {
                interval.timeOut = $interval(requestUpdate, interval.interval * 1000, 0, false, interval);
                interval.running = true;
            }

            return interval.running;
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
            if (!timer) { return; }

            if ($timeout.cancel(timer.timeOut)) {
                timer.running = false;
                timer.interval = null;
                timer.timeOut = null;
                return true;
            }

            return false;
        }

        function cancelInterval (interval) {

            if (_.isString(interval)) { interval = vm[interval]; }
            if (!interval) { return; }

            if ($interval.cancel(interval.timeOut)) {
                interval.running = false;
                interval.interval = null;
                interval.timeOut = null;
                return true;
            }

            return false;
        }
    }
})();
