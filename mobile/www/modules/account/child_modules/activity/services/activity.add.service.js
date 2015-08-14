(function () {
    'use strict';

    angular
        .module('activity')
        .service('activityAddService', activityAddService);

    activityAddService.$inject = ['modalService'];

    function activityAddService (modalService) {
        var vm = this;

        vm.close = function(name){
            modalService.close(name);
        }
    }

})();
