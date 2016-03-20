(function() {
    'use strict';

    angular.module(AppConfig.appModuleName)
        .directive('focusMe', focusMe);

    focusMe.$inject = ['$timeout'];

    function focusMe($timeout) {

        return {
            scope: { trigger: '=focusMe' },
            link: link
        };
        function link(scope, element) {
            scope.$watch('trigger', function focusMeTriggerFn(value) {
                if (value === true) {
                    // logger.debug('trigger',value);
                    $timeout(function focusMeDoFocus() {
                        element[0].focus();
                        scope.trigger = false;
                    }, 100);
                }
            });
        }
    }

})();
