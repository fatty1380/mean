(function () {
    'use strict';

    angular.module(AppConfig.appModuleName)
        .directive('eventFocus', FocusDirective);

    FocusDirective.$inject = ['focusService'];

    function FocusDirective (focusService) {
        return function (scope, elem, attr) {
            elem.on(attr.eventFocus, function () {
                focusService(attr.eventFocusId);
            });

            // Removes bound events in the element itself
            // when the scope is destroyed
            scope.$on('$destroy', function () {
                elem.off(attr.eventFocus);
            });
        };
    }

})();
