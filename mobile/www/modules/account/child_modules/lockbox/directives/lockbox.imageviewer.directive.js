angular
    .module('imageviewer', [])
    .directive('imageviewer', viewer);

function viewer() {
    var directive = {
        restrict: 'A',
        scope: {
            src: '@',
            onImageEvent: '&'
        },
        link: link
    };
    return directive;

    function link(scope, element, attrs) {
        var img, loadImage;
        img = null;

        loadImage = function () {
            scope.onImageEvent({type:'loadStart'});
            img = new Image();
            img.src = attrs.src;
            var el = angular.element('<div style="background: url(' + attrs.src + ') 100% 100% no-repeat;margin: auto;background-size: cover;"/>');
            img.onload = function() {
                element.append(el);
                
                scope.onImageEvent({type:'loadComplete'});
            };
            img.onerror = function() {
                scope.onImageEvent({type:'loadError'});
            };
        };

        scope.$watch((function() {
            return attrs.src;
        }), function (newVal, oldVal) {
            if (!img && !!newVal || oldVal !== newVal) {
                console.log('imageviewer: loadImage(%s)', newVal);
                loadImage();
            }
        });
    }
}
