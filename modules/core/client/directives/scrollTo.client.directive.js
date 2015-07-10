(function () {
    'use strict';

    angular.module('core').directive('scrollTo', function () {
        return {
            restrict: 'A',
            //require: 'ngModel',
            //replace : true,
            link: function (scope, element, attrs, ctrl) {
                $(element).on('click touchstart', function(){
                   $('html, body').animate({
                        scrollTop: $('.section-why-outset').offset().top
                    }, 300);
                });
            }
        };
    });
})();
