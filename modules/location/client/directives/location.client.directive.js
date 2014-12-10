(function() {
    'use strict';

    function LocationDirective() {
        return {
            priority: 0,
            template: '<ui-gmap-google-map center=\'map.center\' zoom=\'map.zoom\' draggable=\'map.draggable\' style=\'{{map.style}}\'></ui-gmap-google-map>',
            replace: false,
            transclude: false,
            restrict: 'E',
            scope: {
                center: '@?',
                style: '@?',
                zipCode: '@?'
            },
            controller: 'LocationController'
        };
    }


    angular.module('location').directive('osMapLocation', LocationDirective);

})();
