(function () {
    'use strict';

    angular
        .module(AppConfig.appModuleName)
        .service('timerService', timerService);

    timerService.$inject = ['$rootScope', '$timeout'];

    function timerService($rootScope, $timeout) {
        var vm = this;
        
        vm.counter = 15;
        vm.myTimeOut = null;

        function onTimeout () {

            if(vm.counter ===  0) {
                $rootScope.$broadcast('timer-stopped', 0);
                return;
            }

            vm.counter--;
            console.warn(' vm.counter --->>>', vm.counter);
            vm.myTimeOut = $timeout(onTimeout, 1000);
        }
        
        function start () {
            vm.myTimeOut = $timeout(onTimeout, 1000);
        }

        function restartTimer () {
            vm.counter = 15;
            vm.myTimeOut = null;

            start();
        }

        return {
            start: start,
            restartTimer: restartTimer
        };
    }
})();
