(function () {
    'use strict';

    function LocationDirective() {
        return {
            priority: 0,
            template: '<map disable-default-u-i="true" scrollwheel="false" draggable="false" zoom-control="true"></map>',
            replace: false,
            transclude: false,
            restrict: 'E',
            scope: {
                address: '=?',
                addresses: '=?',
                center: '@?',
                style: '@?',
                zipCode: '=?'
            },
            controller: 'LocationController',
            controllerAs: 'vm',
            bindToController: true
        };
    }


    angular.module('location')
        .directive('osMapLocation', LocationDirective);


})();
