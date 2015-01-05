'use strict';

function ScrollDirective($window) {
    return {
        scope: {
            scroll: '=scrollPosition'
        },
        link: function (scope, element, attrs) {
            var windowEl = angular.element($window);
            var handler = function () {
                scope.scroll = windowEl.scrollTop();
            };
            windowEl.on('scroll', scope.$apply.bind(scope, handler));
            handler();
        }
    };
}

ScrollDirective.$inject = ['$window'];

angular.module('core').directive('scrollPosition', ScrollDirective);
