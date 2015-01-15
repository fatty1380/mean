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

    ModalFocusDirective.$inject = ['$timeout', '$parse'];
    angular.module('core')
        .directive('modalFocus', ModalFocusDirective);

})();