(function () {
    'use strict';

    angular
        .module(AppConfig.appModuleName)
        .service('timerService', timerService);

    timerService.$inject = ['$rootScope', '$timeout'];

    function timerService($rootScope, $timeout) {
        var vm = this;

        vm.isRunning = false;
        vm.interval = 0;
        vm.counter = 0;
        vm.myTimeOut = null;

        function onTimeout () {

            if(vm.counter ===  0) {
                $rootScope.$broadcast('timer-stopped', 0);
                vm.isRunning = false;
                return;
            }

            vm.counter--;
            vm.myTimeOut = $timeout(onTimeout, 1000);
        }
        
        function start (interval) {
            if(!interval) interval = 15;

            vm.interval = interval;
            vm.counter = interval;

            if(!vm.isRunning) {
                vm.myTimeOut = $timeout(onTimeout, 1000);
                vm.isRunning = true;
            }
        }

        function restartTimer () {
            vm.counter = vm.interval;
            vm.myTimeOut = null;

            start(vm.interval);
        }

        return {
            start: start,
            restartTimer: restartTimer
        };
    }
})();
