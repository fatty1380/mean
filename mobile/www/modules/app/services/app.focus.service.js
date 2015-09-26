(function () {
    'use strict';

    angular
        .module(AppConfig.appModuleName)
        .factory('focusService', focus);

    focus.$inject = ['$timeout', '$rootScope'];

    function focus($timeout, $rootScope) {

        return function(id) {
            // timeout makes sure that it is invoked after any other event has been triggered.
            // e.g. click events that need to run before the focus or
            // inputs elements that are in a disabled state but are enabled when those events
            // are triggered.
            $timeout(function() {
                $rootScope.$broadcast('focusOn', id);
            });
        };
    }
})();
