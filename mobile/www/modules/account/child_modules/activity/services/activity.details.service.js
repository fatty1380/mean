/*
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


        /!*function initialize() {

            var latLng = new google.maps.LatLng(-34.397, 150.644);
            var map = new google.maps.Map(document.getElementById('map'), {
                zoom: 8,
                center: latLng,
                draggable:true,
                sensor: true,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            });
            var marker = new google.maps.Marker({
                position: latLng,
                title: 'Point A',
                map: map,
                draggable: true
            });

            // Update current position info.

            // Add dragging event listeners.
            google.maps.event.addListener(marker, 'touchstart', function() {
                console.log('dragstart');
            });

            google.maps.event.addListener(marker, 'drag', function() {
            });

            google.maps.event.addDomListener(map, 'click', function(e) {
                console.log(e);
                marker.setPosition(e.latLng);
            });

            google.maps.event.addDomListener(map, 'touchstart', function() {
                window.alert('Map was touchstart!');
            });

            google.maps.event.addListener(marker, 'touchend', function() {
                console.log('dragend');
                //  map.setOptions({ draggable: true })
            });
        }*!/

        function setEntry(entry) {
            console.log(entry);
            //initialize();
        }

        function close(name) {
            modalService.close(name);
        }
    };
})();
*/
