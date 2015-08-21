(function() {
    'use strict';

    angular
        .module('activity')
        .controller('ActivityDetailsCtrl', ActivityDetailsCtrl);

    ActivityDetailsCtrl.$inject = ['$scope', 'parameters', 'activityService'];

    function ActivityDetailsCtrl($scope, parameters, activityService) {
        angular.element(document).ready(initialize);

        var vm = this;
        var map = null;
        var marker = null;

        vm.entry = parameters.entry;

        function initialize() {
            if(vm.entry.location.coordinates) {
                var latLng = new google.maps.LatLng(vm.entry.location.coordinates[0], vm.entry.location.coordinates[1]);
                map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 8,
                    center: latLng,
                    draggable:true,
                    sensor: true,
                    zoomControl:true,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                });
                marker = new google.maps.Marker({
                    position: latLng,
                    map: map,
                    draggable: false
                });
                setMarkerInfo(latLng);
            }
        }

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
                        activityService.showPopup("Geocoder error", 'No results found');
                    }
                } else {
                    activityService.showPopup("Geocoder error", status);
                }
            });
        }
        vm.close = function () {
            $scope.closeModal(vm.entry);
        }
    }
})();
