(function () {
    'use strict';

    function ScrollBottomDirective($timeout) {
        return {
            scope: {
                scrollBottom: "="
            },
            link: function (scope, element) {
                scope.$watchCollection('scrollBottom', function (newValue) {
                    if (newValue)
                    {
                        var height = newValue.length * element.children().height();
                        $timeout(function() {
                            height = height || newValue.length * element.children().height();
                            console.log('Scrolling to height: ' + height);
                            element.scrollTopAnimated(height);
                        }, 100);

                    }
                });
            }
        }
    }


    ScrollBottomDirective.$inject = ['$timeout']

    //function ScrollDirective($window) {
    //    return {
    //        scope: {
    //            scroll: '=scrollPosition'
    //        },
    //        link: function (scope, element, attrs) {
    //            var windowEl = angular.element($window);
    //            var handler = function () {
    //                debugger;
    //                scope.scroll = windowEl.scrollTop();
    //            };
    //            windowEl.on('scroll', scope.$apply.bind(scope, handler));
    //            handler();
    //        }
    //    };
    //}
    //
    //ScrollDirective.$inject = ['$window'];
    //
    //angular.module('core').directive('scrollPosition', ScrollDirective);

    function autofillsync($timeout) {
        return {
            require: 'ngModel',
            link: function (scope, elem, attrs, ngModel) {
                var origVal = elem.val();
                $timeout(function () {
                    var newVal = elem.val();
                    if (ngModel.$pristine && origVal !== newVal) {
                        ngModel.$setViewValue(newVal);
                    }
                }, 500);
            }
        };
    }

    autofillsync.$inject = ['$timeout'];

    angular.module('core')
        .directive('scrollBottom', ScrollBottomDirective)
        .directive('autofillsync', autofillsync);


})();
