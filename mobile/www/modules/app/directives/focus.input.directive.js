(function () {
    'use strict';

    angular.module(AppConfig.appModuleName)
        .directive('focusOn', FocusDirective);

    function FocusDirective() {
        return function(scope, elem, attr) {
            scope.$on('focusOn', function(e, name) {
                if(name === attr.focusOn) {
                    elem[0].focus();
                }
            });

            // Removes bound events in the element itself
            // when the scope is destroyed
            scope.$on('$destroy', function() {
                elem.off(attr.focusOn);
            });
        };
    }

})();
