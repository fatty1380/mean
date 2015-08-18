(function() {
    'use strict';

    angular
        .module('activity')
        .controller('ActivityDetailsCtrl', ActivityDetailsCtrl);

    ActivityDetailsCtrl.$inject = ['$scope', 'parameters'];

    function ActivityDetailsCtrl($scope, parameters) {
        angular.element(document).ready(initialize);

        var vm = this;
        vm.entry = parameters.entry;

        function initialize() {
            console.log(vm.entry);
            console.log(vm.entry.location);

            var latLng = new google.maps.LatLng(vm.entry.location.coordinates[0], vm.entry.location.coordinates[1]);
            var map = new google.maps.Map(document.getElementById('map'), {
                zoom: 3,
                center: latLng,
                draggable:true,
                sensor: true,
                zoomControl:true,
                mapTypeId: google.maps.MapTypeId.ROADMAPпше
            });
            var marker = new google.maps.Marker({
                position: latLng,
                title: 'Point A',
                map: map,
                draggable: false
            });

            google.maps.event.addDomListener(map, 'click', function(e) {
                var latlng = { lat: e.latLng.G, lng: e.latLng.K };
                getPlaceName(latlng);
                vm.loc = latlng;
                console.log(vm.loc);
            });

            function getPlaceName(latlng) {
                if(!geocoder){
                    var geocoder = new google.maps.Geocoder;
                }
                geocoder.geocode({'location': latlng}, function(results, status) {
                    if (status === google.maps.GeocoderStatus.OK) {
                        if (results[1]) {
                            marker.setPosition(latlng);
                            vm.loc = latlng;
                            vm.where = results[1].formatted_address;
                        } else {
                            window.alert('No results found');
                        }
                    } else {
                        window.alert('Geocoder failed due to: ' + status);
                    }
                });
            }
        }

        vm.close = function () {
            $scope.closeModal(vm.entry);
        }
    }

})();
