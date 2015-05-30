(function () {
    'use strict';

    angular.module('core').directive('videoPlayer', function () {
        return {
            restrict: 'A',
            template: '<div class="youtube-container"><div class="youtube-player"></div></div>',

            link: function (scope, element, attrs, ctrl) {
                var _this = this;

                (function () {
                    var v = document.getElementsByClassName('youtube-player');
                    for (var n = 0; n < v.length; n++) {
                        var p = document.createElement('div');
                        p.innerHTML = labnolThumb(scope.vm.text.subhero.videoID);
                        p.onclick = labnolIframe;
                        v[n].appendChild(p);
                    }
                })();

                function labnolThumb(id) {
                    return '<img class="youtube-thumb" src="modules/core/img/backgrounds/play_video_bg.jpg" /><div class="control-button-wrapper"><div class="play-icon"><div class="triangle"></div></div><div class="control-text">Play Video</div></div>';
                }

                function labnolIframe() {
                    var iframe = document.createElement('iframe');
                    iframe.setAttribute('src', scope.vm.text.subhero.videoURL + '?autoplay=1&autohide=2&border=0&wmode=opaque&enablejsapi=1&controls=0&showinfo=0');
                    iframe.setAttribute('frameborder', '0');
                    iframe.setAttribute('id', 'youtube-iframe');
                    _this.parentNode.replaceChild(iframe, _this);
                }
            }
        };
    });
})();
