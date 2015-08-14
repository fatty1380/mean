(function () {
    'use strict';

    angular
        .module('activity')
        .service('activityDetailsService', activityDetailsService);

    activityDetailsService.$inject = ['modalService'];

    function activityDetailsService(modalService) {
        var vm = this;
        vm.entry = {
            location: {
                coordinates:[]
            }
        };
        vm.close = close;
        vm.setEntry = setEntry;


        function setEntry(entry) {
            console.log(entry);
            entry.id = 'new';
            entry.zoom = 12;
            vm.entry = entry;
            vm.center = { latitude: vm.entry.location.coordinates[0], longitude: vm.entry.location.coordinates[1] };
            vm.markerCoords = { latitude: vm.entry.location.coordinates[0], longitude: vm.entry.location.coordinates[1] };
        }

        function close(name) {
            modalService.close(name);
        }
    };
})();
