(function () {
    'use strict';

    angular
        .module(AppConfig.appModuleName)
        .service('timerService', timerService);

    timerService.$inject = ['$rootScope', '$timeout'];

    function timerService($rootScope, $timeout) {
        var vm = this;

        vm.isRunning = false;
        vm.interval = null;
        vm.counter = null;
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
            // run immediately for the first time
            if(vm.counter === null){
                vm.counter = 0;
            } else {
                vm.counter = interval;
            }

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
