(function () {
    'use strict';
    angular.module('core').directive('mobileNav', function ($timeout) {
        return {
            restriction: 'A',
            link: function ($scope, element, attributes) {
                var clickEventType = ((document.ontouchstart !== null) ? 'click' : 'touchstart');
                $(element).on(clickEventType, function () {
                    if ($(this).hasClass('active')) {
                        $('.menu-list').removeClass('opened');
                        $('.mobile-nav').removeClass('active');
                    } else {
                        $('.menu-list').addClass('opened');
                        $('.mobile-nav').addClass('active');
                    }
                });

                $('body').on(clickEventType, function (e) {
                    if (!$(e.target).hasClass('mobile-nav') && $('.mobile-nav').is(':visible')) {
                        $('.menu-list').removeClass('opened');
                        $('.mobile-nav').removeClass('active');
                    }
                });
            }
        };
    });
})();
