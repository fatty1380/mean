(function () {
    'use strict';

// FluidVids Directive
    function fluidVidsDirective() {

        return {
            restrict: 'E',
            replace: true,
            scope: {
                video: '@'
            },
            template: '<div class="fluidvids">' +
            '<iframe ng-src="{{ vm.videoURL }}"></iframe>' +
            '</div>',
            link: function (scope, element, attrs) {
                var ratio = (attrs.height / attrs.width) * 100;
                element[0].style.paddingTop = ratio + '%';
            },
            controller: ['$sce', function ($sce){
                var vm = this;

                vm.videoURL = $sce.trustAsResourceUrl(vm.video + '?controls=0&rel=0&showinfo=0&autohide=1&modestbranding=1');
            }],
            controllerAs : 'vm',
            bindToController: true
        };

    }


    angular.module('core').directive('fluidvids', fluidVidsDirective);

})();
