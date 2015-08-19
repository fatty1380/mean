(function() {
    'use strict';

    angular
        .module('activity')
        .controller('ActivityAddCtrl', ActivityAddCtrl);

    ActivityAddCtrl.$inject = ['$scope','activityService', '$ionicLoading'];

    function ActivityAddCtrl($scope, activityService, $ionicLoading) {
        angular.element(document).ready(initialize);

        var vm = this;
        vm.activity = {
            title : '',
            message : '',
            location : {
                type: 'Point',
                coordinates:[],
                created: ''
            }
        }

        vm.saveFeed = saveFeed;

        function saveFeed() {
            $ionicLoading.show({
                template: 'post feed'
            });
            activityService.postFeed(vm.activity).then(function(result) {
                $ionicLoading.hide();
                console.log(result);
                vm.close(result._id);
            });
        }

        function initialize() {
            var latLng = new google.maps.LatLng(39.904903, -75.230039);
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

            google.maps.event.addDomListener(map, 'click', function(e) {
                var latlng = { lat: e.latLng.G, lng: e.latLng.K };
                getPlaceName(latlng);
                vm.loc = latlng;
                vm.activity.location.coordinates = [e.latLng.G, e.latLng.K];
            });

           var infoWindow = new google.maps.InfoWindow({
                content:  ''
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

                            infoWindow.setContent(results[1].formatted_address)
                            infoWindow.open(map, marker);

                            $scope.$digest();
                        } else {
                            window.alert('No results found');
                        }
                    } else {
                        window.alert('Geocoder failed due to: ' + status);
                    }
                });
            }
        }

        vm.close = function (str) {
            $scope.closeModal(str);
        }
    }
})();
