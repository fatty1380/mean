angular
    .module('imageviewer', [])
    .directive('imageviewer', viewer);

function viewer () {
    var directive = {
        restrict: 'A',
        scope: {
            src: '@',
            onImageEvent: '&'
        },
        link: link
    };
    return directive;

    function link (scope, element, attrs) {
        var img, loadImage;
        img = null;

        loadImage = function () {
            scope.onImageEvent({ type:'loadStart' });
            img = new Image();
            img.src = attrs.src;
            var el = angular.element('<image src="' + attrs.src + '" style="width:100%; vertical-align:top;"/>');
            img.onload = function (result) {
                element.append(el);

                scope.onImageEvent({ type:'loadComplete' });
            };
            img.onerror = function (err, a2, a3) {
                scope.onImageEvent({ type:'loadError', err: err });
            };
        };

        scope.$watch((function () {
            return attrs.src;
        }), function (newVal, oldVal) {
            if (!img && !!newVal || oldVal !== newVal) {
                logger.debug('imageviewer: loadImage(%s)', newVal);
                loadImage();
            }
        });
    }
}
