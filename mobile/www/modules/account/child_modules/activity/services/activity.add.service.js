(function () {
    'use strict';

    var activityAddService = function (modalService) {
        var vm = this;

        vm.close = function(name){
            modalService.close(name);
        }
    };

    activityAddService.$inject = ['modalService'];

    angular
        .module('activity')
        .service('activityAddService', activityAddService);
})();
