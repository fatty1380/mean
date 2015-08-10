(function () {
    'use strict';

    var activityDetailsService = function (modalService) {
        var vm = this;

        vm.entry = {};

        vm.close = function(name){
            modalService.close(name);
        }
    };

    activityDetailsService.$inject = ['modalService'];

    angular
        .module('activity')
        .service('activityDetailsService', activityDetailsService);
})();
