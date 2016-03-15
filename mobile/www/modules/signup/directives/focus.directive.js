angular.module('signup')
    .directive('osetFocus', FocusDirective);

function FocusDirective () {
    return {
        restrict: 'A',
        link: function ($scope, elem) {

            elem.bind('keydown', function (event) {
                if ((event.keyCode || event.which) === 13) {
                    event.preventDefault();
                    try {
                        var e = elem.parent().next().children('input');

                        if (_.isEmpty(e)) {
                            e = elem.parent().parent().next().children('input');
                        }
                        if (_.isEmpty(e)) {
                            throw new Error('Unable to locate password in parent or parent\'s parent');
                        }

                        event.preventDefault();
                        e[0].focus();
                    }
                    catch (error) {
                        logger.error('Focus change failed', error);
                    }
                }
            });
        }
    };
}
