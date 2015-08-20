(function() {
    'use strict';

    angular
        .module('activity')
        .controller('ActivityAddCtrl', ActivityAddCtrl);

    ActivityAddCtrl.$inject = ['$scope','activityService', '$ionicLoading', '$cordovaGeolocation'];

    function ActivityAddCtrl($scope, activityService, $ionicLoading, $cordovaGeolocation) {
        angular.element(document).ready(getCurrentPosition);

        var latLng = new google.maps.LatLng(39.904903, -75.230039);
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


        function getCurrentPosition() {

            var startPos = new google.maps.LatLng(36.163765, -86.775366);
            var endPos = new google.maps.LatLng(41.873410, -87.642694);

            getDistanceBetween(startPos, endPos);

            var posOptions = {timeout: 10000, enableHighAccuracy: false};

            $cordovaGeolocation
                .getCurrentPosition(posOptions)
                .then(function (position) {
                    var lat  = position.coords.latitude;
                    var long = position.coords.longitude;

                    latLng = new google.maps.LatLng(lat, long);
                    initialize();

                    console.log(position);

                }, function(err) {
                    console.log('err',err);
                });
        }

        function getDistanceBetween(start, finish) {
            var service = new google.maps.DistanceMatrixService;
            service.getDistanceMatrix({
                origins: [start],
                destinations: [finish],
                travelMode: google.maps.TravelMode.DRIVING,
                unitSystem: google.maps.UnitSystem.METRIC,
                avoidHighways: false,
                avoidTolls: false
            }, function(response, status) {
                if (status !== google.maps.DistanceMatrixStatus.OK) {
                    alert('Error was: ' + status);
                } else {
                    var originList = response.originAddresses;
                    var destinationList = response.destinationAddresses;

                    console.log("response ",response);
                    console.log(" meters ",response.rows[0].elements[0].distance.value);
                }
            })
        }

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

            getPlaceName(latLng);

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

//get straight distance

/*console.log('calcDistance');
 console.log('km: ',calcDistance(startPos, endPos));
 console.log('miles: ',calcDistance(startPos, endPos) / 1.609344);
 function calcDistance(p1, p2){
 return (google.maps.geometry.spherical.computeDistanceBetween(p1, p2) / 1000 );
 }*/