(function () {
    'use strict';

    function ModalFocusDirective($timeout, $parse) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var model = $parse(attrs.modalFocus);

                scope.$watch(model, function (value) {
                    if (value === true) {
                        $timeout(function () {
                            element[0].focus();
                        });
                    }
                });
            }
        };
    }

    /** Source: http://stackoverflow.com/a/25597540/609021 **/
    function FocusFactory($timeout) {
        return function (id) {
            // timeout makes sure that it is invoked after any other event has been triggered.
            // e.g. click events that need to run before the focus or
            // inputs elements that are in a disabled state but are enabled when those events
            // are triggered.
            $timeout(function () {
                var element = document.getElementById(id);
                if (element)
                    element.focus();
            });
        };
    }

    /** Source: http://stackoverflow.com/a/25597540/609021 **/
    function FocusDirective(focus) {
        return function (scope, elem, attr) {
            elem.on(attr.eventFocus, function () {
                focus(attr.eventFocusId);
            });

            // Removes bound events in the element itself
            // when the scope is destroyed
            scope.$on('$destroy', function () {
                element.off(attr.eventFocus);
            });
        };
    }

    ModalFocusDirective.$inject = ['$timeout', '$parse'];
    FocusFactory.$inject = ['$timeout'];

    angular.module('core')
        .factory('focus', FocusFactory)
        .directive('modalFocus', ModalFocusDirective);

    FocusDirective.$inject = ['focus'];
    angular.module('core')
        .directive('eventFocus', FocusDirective)

})();
