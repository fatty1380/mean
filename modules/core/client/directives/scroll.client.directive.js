'use strict';

function ScrollDirective($window) {
    return function(scope, element, attrs) {
        angular.element($window).bind('scroll', function() {
            if (scope.showInfo || scope.showSignup) return;

            if (this.pageYOffset > 0) {
                scope.showInfo = true;
                scope.$apply();
            }
        });
    };
}

ScrollDirective.$inject = ['$window'];

angular.module('core').directive('scroll', ScrollDirective);
