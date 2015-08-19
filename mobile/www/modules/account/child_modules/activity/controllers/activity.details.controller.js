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

            var latLng = new google.maps.LatLng(vm.entry.location.coordinates[0], vm.entry.location.coordinates[1]);
            var map = new google.maps.Map(document.getElementById('map'), {
                zoom: 8,
                center: latLng,
                draggable:true,
                sensor: true,
                zoomControl:true,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            });
            var marker = new google.maps.Marker({
                position: latLng,
                title: 'Point A',
                map: map,
                draggable: false
            });

            setMarkerInfo(latLng);

            function setMarkerInfo(latlng) {
                if(!geocoder){
                    var geocoder = new google.maps.Geocoder;
                }
                geocoder.geocode({'location': latlng}, function(results, status) {
                    if (status === google.maps.GeocoderStatus.OK) {
                        console.log(results);
                        if (results[1]) {
                            marker.info = new google.maps.InfoWindow({
                                content:  results[1].formatted_address
                            });
                            marker.info.open(map, marker);
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
