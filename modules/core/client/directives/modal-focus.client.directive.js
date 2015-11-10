(function () {
    'use strict';

    angular.module('core')
        .directive('modalFocus', ModalFocusDirective);
        
    ModalFocusDirective.$inject = ['$timeout', '$parse'];
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


    angular.module('core')
        .factory('focus', FocusFactory);
        
    /** Source: http://stackoverflow.com/a/25597540/609021 **/
    FocusFactory.$inject = ['$timeout'];
    function FocusFactory($timeout) {
        return function (id) {
            // timeout makes sure that it is invoked after any other event has been triggered.
            // e.g. click events that need to run before the focus or
            // inputs elements that are in a disabled state but are enabled when those events
            // are triggered.
            $timeout(function () {
                var element = document.getElementById(id);
                if (element) {
                    element.focus();
                }
            });
        };
    }

    angular.module('core')
        .directive('eventFocus', FocusDirective);
    /** Source: http://stackoverflow.com/a/25597540/609021 **/
    FocusDirective.$inject = ['focus'];
    function FocusDirective(focus) {
        return function (scope, elem, attr) {
            elem.on(attr.eventFocus, function () {
                focus(attr.eventFocusId);
            });

            // Removes bound events in the element itself
            // when the scope is destroyed
            scope.$on('$destroy', function () {
                elem.off(attr.eventFocus);
            });
        };
    }

})();
