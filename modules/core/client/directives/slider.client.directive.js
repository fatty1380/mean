(function () {

    angular.module('core').directive('slider', function () {
        return {
            restrict: 'A',
            //require: 'ngModel',
            //replace : true,
            link: function (scope, element, attrs, ctrl) {
                scope.$on('bullet_done', function (domainElement) {

                    var clickEventType = ((document.ontouchstart !== null) ? 'click' : 'touchstart');

                    var sliderContent,
                        slidesCount,
                        sliderContainer,
                        leftPosition,
                        slide;

                    function init() {
                        sliderContent = $('.slider-content');
                        slidesCount = sliderContent.find('.slide').length;
                        sliderContainer = $('.slider-container');
                        slide = $('.slide');
                        leftPosition = 0;

                        slide.width(sliderContainer.width());
                        sliderContent.width(sliderContainer.width() * slidesCount);

                        sliderContent.css({ 'margin-left': leftPosition + 'px' });

                        setCurrentPaginationItem(leftPosition);

                    }

                    $('.slider-arrow').on(clickEventType, function () {
                        if ($(this).hasClass('left-arrow')) {
                            if (leftPosition < 0) {
                                slidePrev();
                            } else {
                                slideToLast();

                            }
                        } else {
                            if (leftPosition > (-sliderContainer.width() * (slidesCount - 1))) {
                                slideNext();
                            } else {
                                slideToFirst();
                            }
                        }
                    });

                    function slideToFirst() {
                        leftPosition = sliderContainer.width();
                        sliderContent.css({ 'margin-left': leftPosition + 'px' });
                        slideNext();
                    }

                    function slideToLast() {
                        leftPosition = -(sliderContainer.width() * 1);
                        sliderContent.css({ 'margin-left': leftPosition + 'px' });
                        slideNext();
                    }

                    function setCurrentPaginationItem(leftPosition) {
                        var index = Math.abs(Math.round(leftPosition / sliderContainer.width()));
                        var item = $('.pagination-wrapper').children().get(index);
                        $('.pagination-item').removeClass('current');
                        $(item).addClass('current');
                    }

                    function slidePrev() {
                        leftPosition += sliderContainer.width();
                        sliderContent.css({ 'margin-left': leftPosition + 'px' });
                        setCurrentPaginationItem(leftPosition);
                    }

                    function slideNext() {
                        leftPosition -= sliderContainer.width();
                        sliderContent.css({ 'margin-left': leftPosition + 'px' });
                        setCurrentPaginationItem(leftPosition);
                    }

                    init();

                    $(window).off('resize').on('resize', function () {
                        init();
                    });


                    // model -> view
                    //ctrl.$render = function () {
                    //    textarea.html(ctrl.$viewValue);
                    //    editor.setValue(ctrl.$viewValue);
                    //};

                    //ctrl.$render();
                });
                
            }
        };
    });
})();
