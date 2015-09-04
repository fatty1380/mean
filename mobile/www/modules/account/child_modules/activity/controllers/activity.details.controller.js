(function () {
    'use strict';

    angular
        .module('activity')
        .controller('ActivityDetailsCtrl', ActivityDetailsCtrl);

    ActivityDetailsCtrl.$inject = ['parameters', 'activityService'];

    function ActivityDetailsCtrl(parameters, activityService) {
        angular.element(document).ready(initMap);

        var vm = this;
        var map = null;
        var marker = null;

        vm.distanceSinceLastPost = 'no data';
        vm.entry = parameters.entry;
        vm.close = close;
        vm.likeActivity = likeActivity;

        function initMap() {
            if (activityService.hasCoordinates(vm.entry)) {
                var latLng = new google.maps.LatLng(vm.entry.location.coordinates[0], vm.entry.location.coordinates[1]);
                map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 8,
                    center: latLng,
                    draggable: true,
                    sensor: true,
                    zoomControl: true,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                });
                marker = new google.maps.Marker({
                    position: latLng,
                    map: map,
                    draggable: false
                });

                activityService.getPlaceName(latLng).then(
                    function (result) {
                    var infoWindow = new google.maps.InfoWindow({
                        content: result.formatted_address
                    });
                    infoWindow.setContent(result.formatted_address);
                    infoWindow.open(map, marker);
                }, function () {
                    console.log('getPlaceName error');
                });
            }
        }

        function likeActivity() {
            console.log('likeActivity() ', vm.entry.id);
            activityService.likeActivity(vm.entry.id).then(function(result) {
                //update like in feed
                vm.entry.likes = result.data || [];
            },function(resp) {
                console.log(resp);
            });
        }

        function close() {
            vm.closeModal(vm.entry);
        }
    }
})();
